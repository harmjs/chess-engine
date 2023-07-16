mod cache;

use std::{ops::BitXorAssign };

use cache::CACHE;
use crate::piece::{Piece};

const ACTIVE_KINGSIDE: u64 = CACHE[768];
const ACTIVE_QUEENSIDE: u64 = CACHE[769];
const ACTIVE_BOTH: u64 = ACTIVE_KINGSIDE ^ ACTIVE_QUEENSIDE;
const INACTIVE_KINGSIDE: u64 = CACHE[770];
const INACTIVE_QUEENSIDE: u64 = CACHE[771];

const INACTIVE_BOTH: u64 = INACTIVE_KINGSIDE ^ INACTIVE_QUEENSIDE;
const ALL_ACTIVE: u64 = INACTIVE_BOTH ^ ACTIVE_BOTH;

#[derive(Debug, Clone, Copy)]
pub struct ZoobristHash {
    pub values: [u64; 2]
}

impl ZoobristHash {
    pub const QUEENSIDE: [ZoobristHash; 2] = [
        ZoobristHash { values: [ ACTIVE_QUEENSIDE, INACTIVE_QUEENSIDE] }, // White Active Queenside | Black Inactive Queenside
        ZoobristHash { values: [ INACTIVE_QUEENSIDE, ACTIVE_QUEENSIDE] } // Black Active Queenside | White Inactive Queenside
    ];

    pub const KINGSIDE: [ZoobristHash; 2] = [
        ZoobristHash { values: [ ACTIVE_KINGSIDE, INACTIVE_KINGSIDE] }, // White Active Kingside | Black Inactive Kingside
        ZoobristHash { values: [ INACTIVE_KINGSIDE, ACTIVE_KINGSIDE] } // Black Active Kingside | White Inactive Kingside
    ];

    pub const BOTH: [ZoobristHash; 2] = [
        ZoobristHash { values: [ ACTIVE_BOTH, INACTIVE_BOTH] }, // White Active Both | Black Inactive Both
        ZoobristHash { values: [ INACTIVE_BOTH, ACTIVE_BOTH] } // Black Active Both | White Inactive Both
    ];
}

impl BitXorAssign for ZoobristHash {
    fn bitxor_assign(&mut self, rhs: Self) {
        self.values[0] ^= rhs.values[0];
        self.values[1] ^= rhs.values[1];
    }
}

impl From<i8> for ZoobristHash {
    fn from(enpassent: i8) -> Self {
        match enpassent {
            0..=7 => ZoobristHash { 
                values: [CACHE[772 + enpassent as usize], CACHE[779 - enpassent as usize]]  
            },
            _ => unreachable!("Invalid enpassent")
        }
    }
}

// the black and white hashes have to be the same for a given situation !...

impl From<Piece> for ZoobristHash {
    fn from(piece: Piece) -> Self {
        // world from whites perspective where white is always active
        let class: usize = piece.class.into();
    
        let white_color: usize = piece.color.into(); // if the piece is white this is 0 if black 1
        let white_position = piece.position.unwrap();
    
        let white_x: usize = white_position.x as usize;
        let white_y: usize = white_position.y as usize;
    
        let white_index: usize = white_color + class * 2 
            + white_x * 2 * 6 + white_y * 2 * 6 * 8;
    
        // world from blacks perspective as if black is playing white
        let black_color: usize = piece.color.flip().into();
        let black_x: usize = 7 - white_x;
        let black_y: usize = 7 - white_y;
    
        let black_index: usize = black_color + class * 2 
            + black_x * 2 * 6 + black_y * 2 * 6 * 8;

        // in the black world 
    
        ZoobristHash { values: [CACHE[white_index], CACHE[black_index]] }
    }
}