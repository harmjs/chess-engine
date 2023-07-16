use std::collections::HashMap;
use std::hash::Hash;

use crate::piece::{Class};
use crate::board::{Play, PlayKind};


#[derive(Debug, Clone, Copy, PartialEq)]
enum SanAmbiguity {
    Ambiguous,
    NonAmbiguous(usize, i8)
}

pub fn get_unambiguous<'a>(plays: &'a Vec<Play>) -> HashMap<String, &'a Play> {
    let mut stack: Vec<(usize, i8)> = (0..plays.len()).map(|index: usize| (index, 0)).collect();

    let mut san_ambiguity_map: HashMap<String, SanAmbiguity> = HashMap::new();

    while let Some((index, case)) = stack.pop() {
        let kind: &PlayKind = &plays[index].kind;

        let san: String = match (kind, case) {
            (PlayKind::Move {piece, destination}, 0) if piece.class == Class::Pawn => {
                destination.get_coord_name()
            },
            (PlayKind::Move { piece, destination }, 0) => {
                piece.class.get_name() + &destination.get_coord_name()
            },
            (PlayKind::Move { piece, destination }, 1) => {
                piece.class.get_name() + &piece.position.unwrap().get_x_coord_name() + &destination.get_coord_name()
            },
            (PlayKind::Move { piece, destination }, 2) => {
                piece.class.get_name() + &piece.position.unwrap().get_y_coord_name() + &destination.get_coord_name()
            },
            (PlayKind::Move { piece, destination }, 3) => {
                piece.class.get_name() + &piece.position.unwrap().get_coord_name() + &destination.get_coord_name()
            },
            (PlayKind::Capture { piece, occupier }, 0) if piece.class == Class::Pawn => {
                piece.position.unwrap().get_x_coord_name() + "x" + &occupier.position.unwrap().get_coord_name()
            },
            (PlayKind::Capture { piece, occupier }, 1) if piece.class == Class::Pawn => {
                piece.position.unwrap().get_coord_name() + "x" + &occupier.position.unwrap().get_coord_name()
            },
            (PlayKind::Capture { piece, occupier }, 0) => {
                piece.class.get_name() + "x" + &occupier.position.unwrap().get_coord_name()
            },
            (PlayKind::Capture { piece, occupier }, 1) => {
                piece.class.get_name() + &piece.position.unwrap().get_x_coord_name() + "x" + &occupier.position.unwrap().get_coord_name()
            },
            (PlayKind::Capture { piece, occupier }, 2) => {
                piece.class.get_name() + &piece.position.unwrap().get_y_coord_name() + "x" + &occupier.position.unwrap().get_coord_name()
            },
            (PlayKind::Capture { piece, occupier }, 3) => {
                piece.class.get_name() + &piece.position.unwrap().get_coord_name() + "x" + &occupier.position.unwrap().get_coord_name()
            },
            (PlayKind::Promotion { pawn, destination, promotion }, 0) => {
                destination.get_x_coord_name() + &promotion.get_name()
            },
            (PlayKind::PromotionCapture { pawn, occupier, promotion }, 0) => {
                pawn.position.unwrap().get_x_coord_name() + "x" + &occupier.position.unwrap().get_coord_name() + &promotion.get_name()
            },
            (PlayKind::PromotionCapture { pawn, occupier, promotion }, 1) => {
                pawn.position.unwrap().get_coord_name() + "x" + &occupier.position.unwrap().get_coord_name() + &promotion.get_name()
            },
            (PlayKind::Enpassent { pawn, occupier, destination }, 0) => {
                pawn.position.unwrap().get_x_coord_name() + "x" + &destination.get_coord_name()
            },
            (PlayKind::Enpassent { pawn, occupier, destination }, 1) => {
                pawn.position.unwrap().get_coord_name() + "x" + &destination.get_coord_name()
            },
            (PlayKind::KingSideCastle, 0) => String::from("0-0"),
            (PlayKind::QueenSideCastle, 0) => String::from("0-0-0"),
            _ => unreachable!("Unhandled san ambiguity: {:?} {}", kind, case)
        };

        print!("{}", san);

        // if the position is found again, set it to ambigious and push cases back onto the stack incrementing the case  
        if let Some(san_ambiguity) = san_ambiguity_map.get(&san).cloned() {
            if let SanAmbiguity::NonAmbiguous(index, case) = san_ambiguity {
                san_ambiguity_map.insert(san, SanAmbiguity::Ambiguous);
                stack.push((index, case + 1));
            }
            stack.push((index, case + 1));
        } else {
            san_ambiguity_map.insert(san, SanAmbiguity::NonAmbiguous(index, case));
        }
    }

    let mut san_play_map: HashMap<String, &Play> = HashMap::new();

    for (san, ambiguity) in san_ambiguity_map.iter() {
        match *ambiguity {
            SanAmbiguity::NonAmbiguous ( index, case ) => {
                san_play_map.insert(san.to_string(), &plays[index]);
            },
            SanAmbiguity::Ambiguous => {}
        }
    }

    return san_play_map;
}
