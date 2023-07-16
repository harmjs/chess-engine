use std::cmp::Ordering;
use std::io::{Error, ErrorKind};

use crate::board::{Board, CastleRight};
use crate::piece::{Piece, Coord, Color, Class, self};
use crate::zoobrist::{ZoobristHash};

pub fn to_board(fen: &str) -> Result<Board, Error>{
    let fen: Vec<&str> = fen.split(" ").collect();

    if fen.len() != 6 { 
        return Err(Error::new(
            ErrorKind::Other,
            "Notation does not have 6 fields seperated by a space"));
    }

    let rows: Vec<&str> = fen[0].split("/").collect();
    
    if rows.len() != 8 {
        return Err(Error::new(
            ErrorKind::Other,
            "Notation's first field must have 8 rows seperated by a /"));
    }

    let mut white_pieces: Vec<Piece> = Vec::with_capacity(16);
    let mut black_pieces: Vec<Piece> = Vec::with_capacity(16);

    let mut x: i8 = 0;
    let mut y: i8 = 7;

    for row in rows {
        x = 0;
        for char in row.chars() {
            if char.is_numeric() {
                let offset = char.to_digit(10).unwrap() as i8;
                x += offset;
            } else {
                let class = match &char.to_ascii_lowercase() {
                    'k' => Class::King,
                    'q' => Class::Queen,
                    'r' => Class::Rook,
                    'b' => Class::Bishop,
                    'n' => Class::Knight,
                    'p' => Class::Pawn,
                    _ => unreachable!("Type not recognized")
                };

                let position: Option<Coord> = Some (Coord { x, y });

                match char.is_ascii_uppercase() {
                    true => white_pieces.push(Piece { index: 0, class, position, color: Color::White }),
                    false => black_pieces.push(Piece { index: 0, class, position, color: Color::Black })
                };
                x += 1;
            }
        }
        y -= 1;
    }

    fn compare_piece(a: &Piece, b: &Piece) -> Ordering {
        return a.get_weight().cmp(&b.get_weight());
    }

    white_pieces.resize_with(
        16, || Piece { index: 0, color: Color::White, class:Class::Pawn, position: None});
    black_pieces.resize_with(
        16, || Piece { index: 0, color: Color::Black, class:Class::Pawn, position: None});

    let pieces: Vec<Piece> = white_pieces.iter().chain(black_pieces.iter()).cloned().collect();
    let mut pieces: [Piece; 32] = pieces.try_into().unwrap();
    pieces.sort_by(compare_piece);

    for index in 0..pieces.len() { 
        pieces[index].index = index;
    }

    let active_color = match fen[1].chars().nth(0).unwrap() {
        'w' => Color::White,
        'b' => Color::Black,
        _ => unreachable!()
    };

    let mut castle_rights: [CastleRight; 2] = [CastleRight::None, CastleRight::None];

    for char in fen[2].chars() {
        match char {
            'Q' => castle_rights[0] = if castle_rights[0] == CastleRight::None 
                { CastleRight::QueenSide } else { CastleRight::Both },
            'K' => castle_rights[0] = if castle_rights[0] == CastleRight::None 
                { CastleRight::KingSide } else { CastleRight::Both },
            'k' => castle_rights[1] = if castle_rights[1] == CastleRight::None 
                { CastleRight::QueenSide } else { CastleRight::Both },
            'q' => castle_rights[1] = if castle_rights[1] == CastleRight::None 
                { CastleRight::KingSide } else { CastleRight::Both },
            _ => {}
        }
    }

    let enpassent: Option<i8> = match fen[3].chars().nth(0).unwrap() {
        'a' => Some(0),
        'b' => Some(1),
        'c' => Some(2),
        'd' => Some(3),
        'e' => Some(4),
        'f' => Some(5),
        'g' => Some(6), 
        'h' => Some(7),
        _ => None
    };

    let half_move_clock: usize = match fen[4].parse::<usize>() {
        Ok(number) => number,
        Err(e) => unreachable!()
    };

    let full_moves: usize = match fen[5].parse::<usize>() {
        Ok(number) => number,
        Err(e) => unreachable!()
    };

    let ply: usize = full_moves * 2 + (active_color as usize);

    let mut positions: [[Option<usize>; 8]; 8] = [[None; 8]; 8];
    let mut hash: ZoobristHash = ZoobristHash { values: [0, 0] };

    for piece in pieces {
        let position: Coord = piece.position.unwrap();
        positions[position.y as usize][position.x as usize] = Some(piece.index);
        hash ^= ZoobristHash::from(piece)
    }

    for (index, castle_right) in castle_rights.into_iter().enumerate() {
        match castle_right {
            CastleRight::Both => { hash ^= ZoobristHash::BOTH[index] },
            CastleRight::KingSide => { hash ^= ZoobristHash::KINGSIDE[index] },
            CastleRight::QueenSide => { hash ^= ZoobristHash::QUEENSIDE[index] },
            CastleRight::None => {}
        }
    }

    if let Some(enpassent) = enpassent {
        hash ^= ZoobristHash::from(enpassent);
    }

    return Ok(Board { active_color, pieces, positions, hash, half_move_clock, ply, enpassent, castle_rights});
}

pub fn from_board(board: Board) -> String {
    let fen: Vec<String> = Vec::new();
    let mut positions_fen: Vec<String> = Vec::new();

    for y_arr in board.positions.iter() {
        let mut x_offset: i8 = 0;
        let mut position_fen = String::from("");

        for option_piece_index in y_arr {
            if let Some(piece_index) = option_piece_index {
                if x_offset != 0 {
                    position_fen.push_str(&x_offset.to_string());
                }

                let piece = board.pieces[*piece_index];

                let mut char = match piece.class {
                    Class::King => 'k',
                    Class::Queen => 'q',
                    Class::Rook => 'r',
                    Class::Bishop => 'b',
                    Class::Knight => 'n',
                    Class::Pawn => 'p',
                    _ => unreachable!("Type not recognized")
                };

                if piece.color == Color::White {
                    char = char.to_ascii_uppercase();
                }

                position_fen.push(char);

                x_offset = 0;
            } else {
                x_offset += 1;
            }
        }
        if x_offset != 0 {
            position_fen.push_str(&x_offset.to_string());
        }
        positions_fen.push(position_fen);
    }

    positions_fen.reverse();
    let positions_fen = positions_fen.join("/");

    return positions_fen;
}