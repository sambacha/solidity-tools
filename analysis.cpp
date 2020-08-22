/** https://gist.github.com/chriseth/ea98864522d53e49c8450cf123f46c46 */

#include <iostream>
#include <vector>
#include <optional>
#include <assert.h>

using namespace std;

uint8_t constexpr PUSH = 0x60;
uint8_t constexpr JUMPDEST = 0x5b;
uint8_t constexpr BEGINSUB = 0xb5;

/**
 * Creates two helper data structures for EVM code that allow efficient
 * run-time validation of jump opcodes in line with the
 * "restricted subroutines" proposal.
 * The data structures take code_size / 4 bytes of memory.
 * Initial analysis is linear in the size of the code.
 * Validation of jumps is logarithmic in the subroutine length and can be made constant
 * if the size of the data strutures is increased to code_size * 3/8 bytes.
 *
 * The first data structure is a bitfield containing information about whether
 * a certain code offset is push data or a regular opcode.
 * The second data structure is a bitfield that contains the length of each
 * subroutine in binary encoding.
 */
class Analysis
{
public:

	Analysis(vector<uint8_t> _code):
		m_code(move(_code)),
		m_pushdataBitfield(m_code.size(), false),
		m_subroutineLengths(m_code.size(), false)
	{
		// We assume that the code is non-empty and does not start with the BEGINSUB opcode.
		// If it does, all executions will directly revert, so no analysis is needed.
		if (m_code.empty() || m_code[0] == BEGINSUB)
			return;

		size_t subStart = 0;
		for (size_t i = 0; i < m_code.size(); ++i)
		{
			uint8_t opcode = m_code[i];
			if (opcode == BEGINSUB)
			{
				storeSubroutineLength(subStart, i - subStart);
				subStart = i;
			}
			else if (PUSH <= opcode && opcode < PUSH + 16)
			{
				++i;
				for (size_t j = 0; j < opcode - PUSH + 1 && i < m_code.size(); j++, i++)
					m_pushdataBitfield[i] = true;
			}
		}
		storeSubroutineLength(subStart, m_code.size() - subStart);
	}

	/// @returns the opcode at the given offset unless it is out of range
	/// or inside push data, where it returns nullopt_t.
	optional<uint8_t> opcode(size_t _offset) const
	{
		if (_offset < m_code.size() && !m_pushdataBitfield[_offset])
			return m_code[_offset];
		else
			return {};
	}

	/// @returns true iff @a _jumpTo is a valid jump destination
	/// for a jump operation being executed inside the subroutine that
	/// starts at @a _subroutineStart. In other words, returns false if
	/// @a _jumpTo is not a JUMPDEST opcode, if @a _jumpTo is before
	/// @a _subroutineStart or there is a BEGINSUB opcode between
	/// @a _subroutineStart and @a _jumpTo.
	bool jumpValid(size_t _subroutineStart, size_t _jumpTo) const
	{
		assert(_subroutineStart == 0 || opcode(_subroutineStart) == BEGINSUB);
		if (opcode(_jumpTo) != JUMPDEST || _jumpTo < _subroutineStart)
			return false;

		return _jumpTo - _subroutineStart < subroutineLength(_subroutineStart);
	}

private:
	/// Stores that the subroutine that starts at byte offset @a _start
	/// has a length of @a _length bytes, including the initial
	/// BEGINSUB opcode if present.
	void storeSubroutineLength(size_t _start, size_t _length)
	{
		assert(_length >= 1);
		// A subroutine consists at least of the BEGINSUB
		// opcode (or the main subroutine is at least one byte long),
		// which means we have at least one bit of space. Longer
		// subroutines can hold their binary-encoded length anyway.
		for (; _length > 0; ++_start, _length >>= 1)
			m_subroutineLengths[_start] = _length & 1;
	}

	/// @returns the length of the subroutine starting at offset @a _offset.
	size_t subroutineLength(size_t _offset) const
	{
		assert(_offset == 0 || opcode(_offset) == BEGINSUB);
		size_t length = 0;

		// We read the length bit-by-bit and check if the condition for
		// "end of subroutine" is true for that length.
		// Since the length encodes the first such situation and it only
		// grows while reading, this will result in the correct value.
		//
		// This method makes the use of an "end marker" for the length unnecessary.
		// Such an "end marker" can be added, potentially doubling the size
		// of the bitfield but removing the need for reading a logarithmic
		// number of bytes from the code here.
		for (size_t bit = 0; true; ++bit)
		{
			length |= size_t(m_subroutineLengths[_offset + bit]) << bit;
			if (
				length > 0 &&
				(_offset + length >= m_code.size() || opcode(_offset + length) == BEGINSUB)
			)
				return length;
		}
	}

	vector<uint8_t> m_code;
	vector<bool> m_pushdataBitfield;
	vector<bool> m_subroutineLengths;
};
