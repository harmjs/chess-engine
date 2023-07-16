mod piece;
mod zoobrist;
mod board;
mod san;
mod fen;

use board::{Play, Board, PlayKind };

const STANDARD_FEN: &str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0";

fn main() {
    
    let board: Result<Board, std::io::Error> = fen::to_board(STANDARD_FEN);
    let fen = fen::from_board(board.unwrap());

    dbg!(fen);

    //dbg!(board);

    /*
    let mut board: Board = Board::from_pieces(STANDARD_PIECES);

    let san_plays: [&str; 1] = ["e4"]; //", "Be3" "Nf3", "0-0"

    let plays: Vec<Play> = board.get_plays();
    let san_plays = san::get_unambiguous(&plays);

    if let Some(play) = san_plays.get("e4") {
        board = play.board.clone();
    } else {
        unreachable!()
    }

    let plays: Vec<Play> = board.get_plays();

    /* let san_plays = san::get_unambiguous(&plays);

    println!("{:?}", san_plays.keys());
    */

    let play_kinds: Vec<&PlayKind> = plays
        .iter().map(|play| &play.kind).collect();

    for play_kind in play_kinds {
        match *play_kind {
            PlayKind::Enpassent { pawn, occupier, destination } => {
                dbg!(play_kind);
            },
            _ => {}
        }
    }
    

    /*

    for san_play in san_plays {
        let plays = board.get_plays();
        let san_plays = san::get_unambiguous(&plays);

        if let Some(play) = san_plays.get(san_play) {
            board = play.board.clone();
        } else {
            unreachable!("{} is not in play list", san_play);
        }
    }
    */

    */
}