
``` bash
# New FEN
RKBZQBKR/PPPPPPPP/8/8/8/8/pppppppp/rkbzqbkr
# Bishop / Rook / Knight / Pawn benchmark
2BZQB1R/PPPPPP2/R4KPP/2K5/4B1r1/2k5/pppppppp/r1bzqbk1
# BRKP flex
3ZQ3/PPPPPP2/R2B1KP1/7R/K3B1r1/2k2k2/ppppppp1/r1bzqb2
```

## major

* Correct isActive / isRoute border color conflict
* Fix tile units (or stop using viewport) for scaling

## readme before a rebuild

* FEN should be foundational and primary, all else (grid/visuals) secondary
* read FEN: if pretty (`/[2-9]/`), if ugly (`/\w*\/\w/`), if raw (`/[^\/]/`), then act. All FEN modifications through a singular parser, movements via raw `splice`, translate raw to pretty / ugly
* Characters should be movement/stat-based or outsource movement to role components
* Grid should focus on aesthetic necessities and logic for bounds, have a singular FEN navigator function
* All movement should be stream-based starting at FENdex
* Single moves should draw from a `move(1)`-esque function
* Outsource game-specific meta logic to root instance or specified logic component
