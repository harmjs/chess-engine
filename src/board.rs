use std::cmp::Ordering;

use std::collections::HashSet;

use crate::piece::{Piece, Coord, Color, Class};
use crate::zoobrist::{ZoobristHash};


#[derive(Debug, Clone, Copy, PartialEq)]
pub enum CastleRight {
    Both,
    KingSide,
    QueenSide,
    None
}

pub enum CastleType {
    King,
    QueenRook,
    KingRook
}

impl CastleType {
    pub fn from_index(index: usize) -> Option<Self> {
        match index { 
            8 | 24 => Some(CastleType::QueenRook),
            12 | 28 => Some(CastleType::King),
            15 | 31 => Some(CastleType::KingRook),
            _ => None
        }
    }
}

#[derive(Debug, Clone)]
pub struct Board {
    pub active_color: Color,
    pub pieces: [Piece; 32],
    pub positions: [[Option<usize>; 8]; 8],
    pub ply: usize,
    pub half_move_clock: usize,
    pub hash: ZoobristHash,
    pub enpassent: Option<i8>,
    pub castle_rights: [CastleRight; 2]
}

#[derive(Debug)]
pub enum PlayKind {
    Move { piece: Piece, destination: Coord },
    Capture { piece: Piece, occupier: Piece },
    Promotion { pawn: Piece, destination: Coord, promotion: Class },
    PromotionCapture { pawn: Piece, occupier: Piece, promotion: Class },
    Enpassent { pawn: Piece, occupier: Piece, destination: Coord},
    KingSideCastle,
    QueenSideCastle,
}

pub struct Play { 
    pub kind: PlayKind, 
    pub board: Board
}

impl Board {
    // we are mainly getting the piece index in the position map when we are finding the piece location
    // it is arbitrary... we could use a hash map 

    pub fn from_pieces(pieces: [Piece; 32]) -> Self
    {
        let mut positions: [[Option<usize>; 8]; 8] = [[None; 8]; 8];
        
        let enpassent: Option<i8> = None;
        let castle_rights: [CastleRight; 2] = [CastleRight::Both; 2];

        let mut hash: ZoobristHash = ZoobristHash { values: [0, 0] };

        for piece in pieces {
            let position = piece.position.unwrap();
            positions[position.y as usize][position.x as usize] = Some(piece.index);
            hash ^= ZoobristHash::from(piece)
        }

        let ply: usize = 0;
        let half_move_clock = 0;
        let active_color = Color::White;

        Board { active_color, pieces, positions, hash, half_move_clock, ply, enpassent, castle_rights}
    }

    pub fn get_plays(self) -> Vec<Play> {
        let mut plays: Vec<Play> = Vec::with_capacity(50);

        let active_index: usize = self.active_color as usize;
        let castle_rights: CastleRight = self.castle_rights[active_index];

        println!("Finding plays for {:?}", self.active_color);

        let active_pieces: &[Piece] = match self.active_color {
            Color::White => &self.pieces[..16],
            Color::Black => &self.pieces[16..]
        };

        for piece in active_pieces {
            let piece: Piece = *piece;
            if piece.position.is_none() { continue }

            println!("Finding plays for {:?} {:?} at {:?}", 
                piece.color, piece.class, piece.position.unwrap());
                
            match piece.class {
                Class::Pawn => {
                    self.find_pawn_moves(piece, &mut plays)
                },
                Class::Knight => self.find_moves_in_directions(
                    piece, &Coord::KNIGHT, &mut plays),
                Class::Bishop => self.find_moves_in_cont_directions(
                    piece, &Coord::INTERCARDINAL, &mut plays),
                Class::Rook => self.find_moves_in_cont_directions(
                    piece, &Coord::CARDINAL, &mut plays),
                Class::Queen => self.find_moves_in_cont_directions(
                    piece, &Coord::ALL, &mut plays),
                Class::King => self.find_moves_in_directions(
                    piece, &Coord::ALL, &mut plays)
            }
        }

        match castle_rights {
            CastleRight::Both => {  
                if let Some(board) = self.find_kingside_castle() {
                    let kind: PlayKind = PlayKind::KingSideCastle;
                    plays.push(Play { kind, board });
                }
                if let Some(board) = self.find_queenside_castle() {
                    let kind: PlayKind = PlayKind::QueenSideCastle;
                    plays.push(Play { kind, board });
                }
            },
            CastleRight::KingSide => {
                if let Some(board) = self.find_kingside_castle() {
                    let kind: PlayKind = PlayKind::KingSideCastle;
                    plays.push(Play { kind, board });
                }
            },
            CastleRight::QueenSide => {
                if let Some(board) = self.find_queenside_castle() {
                    let kind: PlayKind = PlayKind::QueenSideCastle;
                    plays.push(Play { kind, board });
                }        
            },
            CastleRight::None => {}
        }

        return plays;
    }

    pub fn find_kingside_castle(&self) -> Option<Board> {
        let king_index: usize = match self.active_color  {
            Color::White => 12,
            Color::Black => 28
        };

        let rook_index: usize = match self.active_color {
            Color::White => 15,
            Color::Black => 31,
        };

        let king: Piece = self.pieces[king_index]; // we can find the kind data from it's initial position... we know it hasn't moved
        let rook: Piece = self.pieces[rook_index]; // we can find the rook also form it's initial position

        let king_destination: Coord = match self.active_color {
            Color::White => Coord { x: 5, y: 0 },
            Color::Black => Coord { x: 5, y: 7 }
        };

        let rook_destination: Coord = match self.active_color {
            Color::White => Coord { x: 6, y: 0 },
            Color::Black => Coord { x: 6, y: 7 }
        };

        // continue if the two squares in question are empty
        if self.get_at_position(king_destination).is_some() { return None };
        if self.get_at_position(rook_destination).is_some() { return None };

        // continue if the king is currently not in check
        if self.vulnerable_king() { return None };

        // continue if the the sqaure which the king travels across is not in check
        let mut board: Board = self.clone();
    
        board.set_at_position(rook_destination, Some(king));
        if board.vulnerable_king() { return None };

        // continue if the castle is not in check in the final position
        board.set_at_position(rook_destination, Some(rook));
        board.set_at_position(king_destination, Some(king));

        let active_color_index: usize = self.active_color as usize;

        match self.castle_rights[active_color_index] {
            CastleRight::Both => {
                board.castle_rights[active_color_index] = CastleRight::None;
                board.hash ^= ZoobristHash::BOTH[active_color_index];
            },
            CastleRight::KingSide => {
                board.castle_rights[active_color_index] = CastleRight::None;
                board.hash ^= ZoobristHash::KINGSIDE[active_color_index];
            },
            _ => unreachable!()
        }

        return Some(board)
    }


    pub fn find_queenside_castle(&self) -> Option<Board> {
        let king_index: usize = match self.active_color  {
            Color::White => 12,
            Color::Black => 28
        };

        let rook_index: usize = match self.active_color {
            Color::White => 8,
            Color::Black => 24,
        };

        let king: Piece = self.pieces[king_index];
        let rook: Piece = self.pieces[rook_index];

        // single square which the rook passes through which the king doesn't (needs to be empty)
        let rook_transit: Coord = match self.active_color {
            Color::White => Coord { x: 1, y: 0},
            Color::Black => Coord { x: 1, y: 8}
        };

        let king_destination: Coord = match self.active_color {
            Color::White => Coord { x: 3, y: 0 },
            Color::Black => Coord { x: 3, y: 8 }
        };

        let rook_destination: Coord = match self.active_color {
            Color::White => Coord { x: 2, y: 0},
            Color::Black => Coord { x: 2, y: 8 }
        };

         // continue if the three squares in question are empty
        if self.get_at_position(rook_transit).is_some() { return None };
        if self.get_at_position(king_destination).is_some() { return None };
        if self.get_at_position(rook_destination).is_some() { return None };

        // continue if the king is currently not in check
        if self.vulnerable_king() { return None };

        // continue if the the sqaure which the king travels across is not in check
        let mut board: Board = self.clone();
    
        board.set_at_position(rook_destination, Some(king));
        if board.vulnerable_king() { return None };

        // continue if the castle is not in check in the final position
        board.set_at_position(rook_destination, Some(rook));
        board.set_at_position(king_destination, Some(king));

        let active_color_index = self.active_color as usize;

        match self.castle_rights[active_color_index] {
            CastleRight::Both => {
                board.castle_rights[active_color_index] = CastleRight::None;
                board.hash ^= ZoobristHash::BOTH[active_color_index];
            },
            CastleRight::QueenSide => {
                board.castle_rights[active_color_index] = CastleRight::None;
                board.hash ^= ZoobristHash::QUEENSIDE[active_color_index];
            },
            _ => unreachable!()
        }

        board.tick();

        return Some(board);
    }

    pub fn find_moves_in_cont_directions(
        &self, piece: Piece, directions: &[Coord], plays: &mut Vec<Play>) 
    {
        let position: Coord = piece.position.unwrap();
        for direction in directions {
            let mut multiplier: i8 = 1;

            loop {
                let destination: Coord = position + *direction * multiplier;

                if !destination.is_on_board() { break }

                if let Some(occupier) = self.get_at_position(destination) {
                    // check if the piece can be captured
                    if occupier.color == self.active_color { break }             
                    let mut board: Board = self.clone();
                    board.set_at_position(destination, Some(piece));

                    if !board.vulnerable_king() {
                        board.tick();

                        let kind: PlayKind = PlayKind::Capture { piece, occupier };

                        plays.push(Play { kind, board })
                    }
                    break;
                } else {
                    // open square
                    let mut board: Board = self.clone();
                    board.set_at_position(destination, Some(piece));
                    
                    if !board.vulnerable_king() {
                        board.tick();

                        let kind: PlayKind = PlayKind::Move { piece, destination };
                        plays.push(Play { kind, board });
                    }
                }
                multiplier += 1;
            }
        }
    }

    pub fn find_moves_in_directions(
        &self, piece: Piece, directions: &[Coord], plays: &mut Vec<Play>)
    {
        let position: Coord = piece.position.unwrap();

        for direction in directions {
            let destination: Coord = position + *direction;
            if !destination.is_on_board() { continue; }

            if let Some(occupier) = self.get_at_position(destination) {
                if occupier.color == self.active_color { continue; }

                let mut board = self.clone();
                board.set_at_position(destination, Some(piece));

                if !board.vulnerable_king() {
                    board.tick();

                    let kind: PlayKind = PlayKind::Capture { piece, occupier };

                    plays.push(Play { kind, board });
                }
                
            } else {
                let mut board = self.clone();
                board.set_at_position(destination, Some(piece));

                if !board.vulnerable_king() {
                    board.tick();

                    let kind = PlayKind::Move { piece, destination };

                    plays.push(Play { kind, board });
                }
            }
        }
    }
    
    pub fn find_pawn_moves(&self, pawn: Piece, plays: &mut Vec<Play>) {
        let position: Coord = pawn.position.unwrap();
        let direction: Coord = match self.active_color {
            Color::White => Coord::NORTH,
            Color::Black => Coord::SOUTH
        };

        // regular move
        let destination: Coord = position + direction;

        if self.get_at_position(destination).is_none() {
            // check if moving pawn is legal

            let mut pawn_move_board = self.clone();
            pawn_move_board.set_at_position(destination, Some(pawn));

            if !pawn_move_board.vulnerable_king() {
                let promotion_y: i8 = match self.active_color {
                    Color::White => 7, Color::Black => 0
                };

                if destination.y == promotion_y {
                    for promotion in Class::PROMOTIONS {
                        
                        let mut promotion_board: Board = pawn_move_board.clone();

                        let mut promoted_pawn = pawn;
                        promoted_pawn.class = promotion;

                        promotion_board.set_at_position(destination, Some(promoted_pawn));
                        promotion_board.tick();

                        let kind: PlayKind = PlayKind::Promotion { pawn, destination, promotion };

                        plays.push(Play { kind, board: promotion_board });
                    }
                } else {
                    pawn_move_board.tick();

                    let kind = PlayKind::Move { piece: pawn, destination };

                    plays.push(Play { kind, board: pawn_move_board });
                }
            }
            
            let starting_y: i8 = match self.active_color {
                Color::White => 1,
                Color::Black => 6
            };

            let destination: Coord = position + direction*2;
            
            // pawn push logic
            if position.y == starting_y && self.get_at_position(destination).is_none() {
                let mut pawn_push_board = self.clone();
                pawn_push_board.set_at_position(destination, Some(pawn));

                if !pawn_push_board.vulnerable_king() {

                    pawn_push_board.tick();

                    // tick resets the enpassent state, so 
                    pawn_push_board.enpassent = Some(position.x);
                    pawn_push_board.hash ^= ZoobristHash::from(position.x);

                    let kind = PlayKind::Move { piece: pawn, destination };

                    plays.push(Play { kind, board: pawn_push_board });
                }
            }
        }

        let capture_directions = match self.active_color { 
            Color::White => [Coord::NORTH_EAST, Coord::NORTH_WEST],
            Color::Black => [Coord::SOUTH_EAST, Coord::SOUTH_WEST],
        };

        for capture_direction in capture_directions {
            let destination: Coord = capture_direction + position;

            if !destination.is_on_board() { continue; }

            if let Some(occupier) = self.get_at_position(destination) {
                if occupier.color == self.active_color.flip() {
                    let mut pawn_capture_board = self.clone();
                    pawn_capture_board.set_at_position(destination, Some(pawn));

                    if !pawn_capture_board.vulnerable_king() {
                        let promotion_y: i8 = match self.active_color {
                            Color::White => 7, Color::Black => 0
                        };

                        if destination.y == promotion_y {
                            for promotion in Class::PROMOTIONS {
                                let mut promotion_capture_board: Board = pawn_capture_board.clone();

                                let mut promoted_pawn: Piece = pawn;
                                promoted_pawn.class = promotion;
        
                                promotion_capture_board.set_at_position(destination, Some(pawn));
                                promotion_capture_board.tick();

                                let kind: PlayKind =  PlayKind::PromotionCapture { 
                                    pawn, occupier, promotion 
                                };

                                plays.push(Play { kind, board: promotion_capture_board});
                            }
                        } else {
                            pawn_capture_board.tick();

                            let kind: PlayKind = PlayKind::Capture { piece: pawn, occupier };

                            plays.push(Play { kind, board: pawn_capture_board });
                        }
                    }
                }
            }
        }

        // this code is fucking broken

        if let Some(enpassent_x) = self.enpassent {
            let x_offset: i8 = position.x - enpassent_x;

            // enpassent is possible
            if x_offset.abs() == 1 {
                let captured_coord: Coord = Coord { x: enpassent_x, y: position.y};
                let occupier: Piece = self.get_at_position(captured_coord).unwrap();

                let destination: Coord = Coord {
                    x: enpassent_x, 
                    y: position.y + direction.y
                };

                let mut enpassent_board: Board = self.clone();

                enpassent_board.set_at_position(captured_coord, None);
                enpassent_board.set_at_position(destination, Some(pawn));

                if !enpassent_board.vulnerable_king() {
                    enpassent_board.tick();

                    let kind = PlayKind::Enpassent { pawn, occupier, destination };

                    plays.push(Play { kind, board: enpassent_board });
                }
            }
        }
    }

    fn tick(&mut self) {
        // handle enpassent
        if let Some(enpassent) = self.enpassent {
            self.hash ^= ZoobristHash::from(enpassent);
            self.enpassent = None;
        }

        self.active_color = self.active_color.flip();
    }

    fn handle_active_castle_rights(&mut self, piece: Piece) {
        let active_castle_type: Option<CastleType> = CastleType::from_index(piece.index);

        if let Some(active_castle_type) = active_castle_type {
            let active_color_index: usize = self.active_color.into();        
            let active_castle_rights: CastleRight = self.castle_rights[active_color_index];

            match (active_castle_type, active_castle_rights) {
                (CastleType::King, CastleRight::Both | CastleRight::QueenSide | CastleRight::KingSide) => {
                    self.castle_rights[active_color_index] = CastleRight::None;
                    self.hash ^= ZoobristHash::BOTH[active_color_index];
                },
                (CastleType::QueenRook, CastleRight::Both) => {
                    self.castle_rights[active_color_index] = CastleRight::KingSide;
                    self.hash ^= ZoobristHash::QUEENSIDE[active_color_index];
                },
                (CastleType::QueenRook, CastleRight::QueenSide) => {
                    self.castle_rights[active_color_index] = CastleRight::None;
                    self.hash ^= ZoobristHash::QUEENSIDE[active_color_index];
                },
                (CastleType::KingRook, CastleRight::Both) => {
                    self.castle_rights[active_color_index] = CastleRight::QueenSide;
                    self.hash ^= ZoobristHash::KINGSIDE[active_color_index];
                },
                (CastleType::KingRook, CastleRight::KingSide) => {
                    self.castle_rights[active_color_index] = CastleRight::None;
                    self.hash ^= ZoobristHash::KINGSIDE[active_color_index];
                },
                (_, _) => {}
            }
        }
    }

    fn handle_inactive_castle_rights(&mut self, occupier: Piece) {
        let inactive_castle_type: Option<CastleType> = CastleType::from_index(occupier.index);

        if let Some(inactive_castle_type) = inactive_castle_type {
            let inactive_color_index: usize = self.active_color.flip().into();
            let inactive_castle_rights: CastleRight = self.castle_rights[inactive_color_index];

            match (inactive_castle_type, inactive_castle_rights) {
                (CastleType::QueenRook, CastleRight::Both) => {
                    self.castle_rights[inactive_color_index] = CastleRight::KingSide;
                    self.hash ^= ZoobristHash::QUEENSIDE[inactive_color_index];
                },
                (CastleType::QueenRook, CastleRight::QueenSide) => {
                    self.castle_rights[inactive_color_index] = CastleRight::None;
                    self.hash ^= ZoobristHash::QUEENSIDE[inactive_color_index];
                },
                (CastleType::KingRook, CastleRight::Both) => {
                    self.castle_rights[inactive_color_index] = CastleRight::QueenSide;
                    self.hash ^= ZoobristHash::KINGSIDE[inactive_color_index];
                },
                (CastleType::KingRook, CastleRight::KingSide) => {
                    self.castle_rights[inactive_color_index] = CastleRight::None;
                    self.hash ^= ZoobristHash::KINGSIDE[inactive_color_index];
                },
                (_, _) => {}
            }
        }
    }

    pub fn get_at_position(&self, coord: Coord) -> Option<Piece> {
        if let Some(index) = self.positions[coord.x as usize][coord.y as usize] {
            Some(self.pieces[index])
        } else {
            None
        }
    }

    pub fn set_at_position(&mut self, coord: Coord, piece_option: Option<Piece>) {

        let occupier_option: Option<Piece> = self.get_at_position(coord);

        match (piece_option, occupier_option) {
            (Some(piece), Some(occupier)) => {
                // remove occupier
                let mut next_occupier: Piece = occupier;
                next_occupier.position = None;

                self.pieces[occupier.index] = next_occupier;

                self.hash ^= ZoobristHash::from(occupier);

                let mut next_piece = piece;
                next_piece.position = Some(coord);

                self.pieces[piece.index] = next_piece;

                self.hash ^= ZoobristHash::from(piece); 
                self.hash ^= ZoobristHash::from(next_piece);

                self.positions[coord.x as usize][coord.y as usize] = Some(piece.index);

                println!("{:?} {:?} at {:?} captures {:?} {:?} at {:?}", 
                    piece.color, piece.class, piece.position.unwrap(),
                    occupier.color, occupier.class, coord
                );

                self.handle_active_castle_rights(piece);
                self.handle_inactive_castle_rights(occupier);
            },
            (Some(piece), None) => {
                let mut next_piece = piece;
                next_piece.position = Some(coord);

                self.pieces[piece.index] = next_piece;

                self.hash ^= ZoobristHash::from(piece); 
                self.hash ^= ZoobristHash::from(next_piece);

                self.positions[coord.x as usize][coord.y as usize] = Some(piece.index);

                println!("{:?} {:?} at {:?} moves to {:?}", 
                    piece.color, piece.class, piece.position.unwrap(), coord
                );

                self.handle_active_castle_rights(piece);
            },
            (None, Some(occupier)) => {
                let mut next_occupier: Piece = occupier;
                next_occupier.position = None;

                self.pieces[occupier.index] = next_occupier;

                self.hash ^= ZoobristHash::from(occupier);

                self.positions[coord.x as usize][coord.y as usize] = None;

                println!("{:?} {:?} at {:?} is captured",
                    occupier.color, occupier.class, occupier.position.unwrap());

                // Only known case this would be called is on a pawn captured by enpassent...
                // Cna't trigger castle reights
            },
            (None, None) => { } // Unncessary Call
        }
    }

    pub fn vulnerable_king(&self) -> bool
    {
        let king_index: usize = match self.active_color {
            Color::White => 28, // Black King // King is always index 0
            Color::Black => 12 // White King // King is always index 16
        };

        let king: Piece = self.pieces[king_index];

        let king_position: Coord = king.position.unwrap();

        for direction in Coord::KNIGHT {
            let destination: Coord = king_position + direction;

            if !destination.is_on_board() { continue }
            if let Some(occupier) = self.get_at_position(destination) {
                if occupier.color == self.active_color && occupier.class == Class::Knight {
                    return true
                }
            }
        }

        for coord in Coord::ALL {
            let mut multiplier: i8 = 1;

            let is_cardinal = coord.x == 0 || coord.y == 0;

            loop {
                let direction = coord * multiplier;
                let destination: Coord = king_position + direction;

                if !destination.is_on_board() { break }
                if let Some(occupier) = self.get_at_position(destination) {
                    if occupier.color == self.active_color {
                        let is_regicide: bool = match occupier.class {
                            Class::Pawn if !is_cardinal && multiplier == 1 
                                && self.active_color == Color::Black && coord.y == 1 => true,
                            Class::Pawn if !is_cardinal && multiplier == 1
                                 && self.active_color == Color::White && coord.y == -1 => true,
                            Class::Bishop if !is_cardinal => true,
                            Class::Rook if is_cardinal => true,
                            Class::Queen => true,
                            Class::King if multiplier == 1 => true,
                            _ => false
                        };

                        if is_regicide { return true }
                    }
                    break;
                }
                multiplier += 1;
            }
        }
        false
    }
}