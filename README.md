# Chess Engine 


## Write a CLI interface

for debugging
using nodes readline


## UniqueBoardStateCache Object: {[string encodedBoardState]: Evaluation? [{ int evaluation_score, int evaluation_depth }]}

TODO:
- Find a way to serialize unique board states into strings.
- Find a way to evaluate board states as numbers to some predetermined depth.
- Record all mapped board states and evaluations into an object, to avoid reprocessing duplicate board states.
- Check serialized depth when evaluating, because when duplicate board states are encountered, the evaluation scores with higher depths will be more accurate. (if remaining_depth > cached_evaulation depth: continue evaulution and update cache)

### Unique Board State Serialization
Boardstate repetitions do not change unique board states obviously. The engine keeps track of it internally.

Design constrants:
- tradeoff between speed and memory use
- modular functionality so it can be swapped out or upgraded as needed
- includes weird rules (enpassent, castling, pawn promotion)
- always from a single perspective to simplify rules and remove redundant symmetries

So apparently bitwise operators are still fast in javascript despite the fact that in theory the integers get converted to floating point, because in practise the JIT compiler is much smarter then that. 

Create a unique integer for each piece which encodes in order:

- 1 bit tracking if piece has moved (used for castling, and pawn pushes)
- 1 bit tracking if piece can be captured using enpassent
- 1 bit tracking if it is the current piece's turn
- 3 bits for the type of piece
- 3 bits for the x position
- 1 bits to track if x position is out of bounds (either 00xx or 11xx)
- 3 bits for the y position
- 1 bits to see if the y position is out of bound (either 00xx or 11xx)
- 2 bits unused

All we have to do is sort by size before encoding to ensure uniqueness.

The position tracking bits allow us to freely transform the xy bits without worrying about changing other information. After any xy bit tranformation, we simply mask the xy out of bounds bits and if nothing has changed we know we are in bounds.

A board state makes no differentiation between black and white pieces,
this means the evaluator engine in addition to setting the flag correctly between plays, will have to rotating the board on its y-axis by flipping the y bit), as well as flip the piece turn bit.


### Design considerations for maximum cache hits
To maximimize cache hits on boardstates, we will only utilize the moved bits for pawns, rooks, and the king
Following the same logic, we only have to set the enpassent bit w

#### Design consideration on capturing the King 
In chess pieces only move a certain way. In addition, you may not play a move which causes your king to be captured on the following turn.

As I see it their are two implemenations options:

1. Check for king safety before accepting a boardstate
2. Check king saftey if the king can be captured the next turn

Naively the first implementation is prefered by because it is simpler, and checking for the kings safety can be optimized easily, and is the same definition as check which may come up in other scenarios.

Decide whether or not to cache found unsafe board states as null...

## Moves Function


## Evaluate Function
string boardstate => Evaluation?

Design Considerations: 
- includes a scoring of different peice values
- includes piece position strength maps
- includes how many sqaures are controlled
- includes common openings for navigating the early game
- as stated above, cuts off evaluation wherever the opposing king can be captured and returns null

Seperate Board Serialization States, and evaluate them for.

