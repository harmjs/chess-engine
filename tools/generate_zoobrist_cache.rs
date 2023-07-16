use std::fs::File;
use std::io::Write;
use std::path::Path;

fn main() {
    let cache: Vec<u64> = (0..780).map(|_| rand::random()).collect();

    let dest_path = Path::new("src/zoobrist/cache.rs");
    let mut file = File::create(&dest_path).unwrap();

    writeln!(
        file,
        "pub const CACHE: [u64; 780] = {:?};",
        cache
    )
    .unwrap();
}