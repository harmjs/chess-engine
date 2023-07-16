use std::ops::{Add, Mul, Sub };

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Class {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King
}

impl Class {
    pub const PROMOTIONS: [Class; 4] = [Class::Knight, Class::Bishop, Class::Rook, Class::Queen];

    pub fn get_name(self) -> String {
        match self {
            Class::Pawn => String::from(""),
            Class::Knight => String::from("N"),
            Class::Bishop => String::from("B"),
            Class::Rook => String::from("R"),
            Class::Queen => String::from("Q"),
            Class::King => String::from("K"),
            _ => unreachable!("Invalid Class")
        }
    }
}

impl From<Class> for usize {
    fn from(varient: Class) -> Self {
        match varient {
            Class::Pawn => 0,
            Class::Knight => 1,
            Class::Bishop => 2,
            Class::Rook => 3,
            Class::Queen => 4,
            Class::King => 5,
            _ => unreachable!("Invalid Class")
        }
    }
}

#[derive(PartialEq, Debug, Clone, Copy)]
pub enum Color {
    White,
    Black
}

impl Color {
    pub fn flip(self) -> Color {
        match self {
            Color::Black => Color::White,
            Color::White => Color::Black
        }
    }
}

impl From<Color> for usize {
    fn from(varient: Color) -> Self {
        match varient {
            Color::White => 0,
            Color::Black => 1,
            _ => unreachable!("Invalid Color")
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct Coord {
    pub x: i8,
    pub y: i8
}

impl Coord {
    pub const NORTH: Coord = Coord::new(0, 1);
    pub const NORTH_EAST: Coord = Coord::new(1, 1);
    pub const EAST: Coord = Coord::new(1, 0);
    pub const SOUTH_EAST: Coord = Coord::new(1, -1);
    pub const SOUTH: Coord = Coord::new(0, -1);
    pub const SOUTH_WEST: Coord = Coord::new(-1, -1);
    pub const WEST: Coord = Coord::new(-1, 0);
    pub const NORTH_WEST: Coord = Coord::new(-1, 1);

    pub const CARDINAL: [Coord; 4] = [
        Coord::NORTH, Coord::EAST, Coord::SOUTH, Coord::WEST
    ];
    pub const INTERCARDINAL: [Coord; 4] = [
        Coord::NORTH_EAST, Coord::SOUTH_EAST, Coord::SOUTH_WEST, Coord::NORTH_WEST
    ];
    pub const ALL: [Coord; 8] = [
        Coord::NORTH, Coord::NORTH_EAST, Coord::EAST, Coord::SOUTH_EAST,
        Coord::SOUTH, Coord::SOUTH_WEST, Coord::WEST, Coord::NORTH_WEST
    ];

    pub const KNIGHT: [Coord; 8] = [
        Coord::new(1, 3), Coord::new(-1, 3),
        Coord::new(3, 1), Coord::new(3, -1),
        Coord::new(1, -3), Coord::new(-1, -3),
        Coord::new(-3, 1), Coord::new(-3, -1)
    ];

    const fn new(x: i8, y: i8) -> Self {
        Coord {x, y}
    }

    pub fn is_on_board(self) -> bool {
        self.x >= 0 && self.x <= 7 && self.y >= 0 && self.y <= 7
    }

    pub fn get_x_coord_name(self) -> String {
        match self.x {
            0 => String::from("a"),
            1 => String::from("b"),
            2 => String::from("c"),
            3 => String::from("d"),
            4 => String::from("e"),
            5 => String::from("f"),
            6 => String::from("g"),
            7 => String::from("h"),
            _ => unreachable!("coords should never be > 7 or < 0")
        }
    }

    pub fn get_y_coord_name(self) -> String {
        match self.y {
            0 => String::from("1"),
            1 => String::from("2"),
            2 => String::from("3"),
            3 => String::from("4"),
            4 => String::from("5"),
            5 => String::from("6"),
            6 => String::from("7"),
            7 => String::from("8"),
            _ => unreachable!("coords should never be > 7 or < 0")
        }
    }

    
    pub fn get_coord_name(self) -> String {
        self.get_x_coord_name() + &self.get_y_coord_name()
    }
}

impl Add<Coord> for Coord {
    type Output = Coord;

    fn add(self, other: Coord) -> Coord {
        Coord {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

impl Sub<Coord> for Coord {
    type Output = Coord;

    fn sub(self, other: Coord) -> Coord {
        Coord {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }
}

impl Mul<i8> for Coord {
    type Output = Coord;

    fn mul(self, other: i8) -> Coord {
        Coord {
            x: self.x * other,
            y: self.y * other
        }
    }
}


#[derive(Debug, Clone, Copy)]
pub struct Piece {
    pub color: Color,
    pub class:  Class,
    pub index: usize,
    pub position: Option<Coord>,
}

impl Piece {
    const fn new(index: usize, color: Color, x: i8, y: i8, class: Class) -> Self {
        Piece { index, color, position: Some(Coord { x, y }),
            class
        }
    }

    pub const fn get_weight(self) -> usize {
        let class: usize = self.class as usize;
        let color: usize = self.color as usize;

        return class * 2 + color * 12;
    }
}

/*
pub const STANDARD_PIECES: [Piece; 32] = [
    Piece::new(0, Color::White, 0, 1, Class::Pawn),
    Piece::new(1, Color::White, 1, 1, Class::Pawn),
    Piece::new(2, Color::White, 2, 1, Class::Pawn),
    Piece::new(3, Color::White, 3, 1, Class::Pawn),
    Piece::new(4, Color::White, 4, 1, Class::Pawn),
    Piece::new(5, Color::White, 5, 1, Class::Pawn),
    Piece::new(6, Color::White, 6, 1, Class::Pawn),
    Piece::new(7, Color::White, 7, 1, Class::Pawn),
    Piece::new(8, Color::White, 0, 0, Class::Rook),
    Piece::new(9, Color::White, 1, 0, Class::Knight),
    Piece::new(10, Color::White, 2, 0, Class::Bishop),
    Piece::new(11, Color::White, 3, 0, Class::Queen),
    Piece::new(12, Color::White, 4, 0, Class::King),
    Piece::new(13, Color::White, 5, 0, Class::Bishop),
    Piece::new(14, Color::White, 6, 0, Class::Knight),
    Piece::new(15, Color::White, 7, 0, Class::Rook),
    Piece::new(16, Color::Black, 0, 6, Class::Pawn),
    Piece::new(17, Color::Black, 1, 6, Class::Pawn),
    Piece::new(18, Color::Black, 2, 6, Class::Pawn),
    Piece::new(19, Color::Black, 3, 6, Class::Pawn),
    Piece::new(20, Color::Black, 4, 6, Class::Pawn),
    Piece::new(21, Color::Black, 5, 6, Class::Pawn),
    Piece::new(22, Color::Black, 6, 6, Class::Pawn),
    Piece::new(23, Color::Black, 7, 6, Class::Pawn),
    Piece::new(24, Color::Black, 0, 7, Class::Rook),
    Piece::new(25, Color::Black, 1, 7, Class::Knight),
    Piece::new(26, Color::Black, 2, 7, Class::Bishop),
    Piece::new(27, Color::Black, 3, 7, Class::Queen),
    Piece::new(28, Color::Black, 4, 7, Class::King),
    Piece::new(29, Color::Black, 5, 7, Class::Bishop),
    Piece::new(30, Color::Black, 6, 7, Class::Knight),
    Piece::new(31, Color::Black, 7, 7, Class::Rook)
];
*/

// Sort Pieces []