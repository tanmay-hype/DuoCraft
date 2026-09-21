"use client";

import {
  Check,
  Puzzle,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { useMemo, useState } from "react";

type PhotoPuzzleBoardProps = {
  imageUrl: string;
  recipientName?: string;
  interactive?: boolean;
};

type PuzzlePiece = {
  id: number;
  correctIndex: number;
};

const COLUMNS = 3;
const ROWS = 3;
const PIECE_COUNT = COLUMNS * ROWS;

function createSolvedPieces(): PuzzlePiece[] {
  return Array.from(
    { length: PIECE_COUNT },
    (_, index) => ({
      id: index,
      correctIndex: index,
    }),
  );
}

function shufflePieces(
  pieces: PuzzlePiece[],
): PuzzlePiece[] {
  const next = [...pieces];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [next[index], next[randomIndex]] = [
      next[randomIndex],
      next[index],
    ];
  }

  const solved = next.every(
    (piece, index) => piece.correctIndex === index,
  );

  if (solved && next.length > 1) {
    [next[0], next[1]] = [next[1], next[0]];
  }

  return next;
}

export function PhotoPuzzleBoard({
  imageUrl,
  recipientName,
  interactive = true,
}: PhotoPuzzleBoardProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>(() =>
    interactive
      ? shufflePieces(createSolvedPieces())
      : createSolvedPieces(),
  );

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const complete = useMemo(
    () =>
      pieces.every(
        (piece, index) =>
          piece.correctIndex === index,
      ),
    [pieces],
  );

  const correctCount = useMemo(
    () =>
      pieces.filter(
        (piece, index) =>
          piece.correctIndex === index,
      ).length,
    [pieces],
  );

  function selectPiece(index: number) {
    if (!interactive || complete) {
      return;
    }

    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    setPieces((current) => {
      const next = [...current];

      [next[selectedIndex], next[index]] = [
        next[index],
        next[selectedIndex],
      ];

      return next;
    });

    setSelectedIndex(null);
  }

  function shuffle() {
    setPieces(
      shufflePieces(createSolvedPieces()),
    );
    setSelectedIndex(null);
  }

  function reset() {
    setPieces(createSolvedPieces());
    setSelectedIndex(null);
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose">
            Photo puzzle
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            {complete
              ? "Every piece is in its place."
              : `${correctCount} of ${PIECE_COUNT} pieces are in the right place.`}
          </p>
        </div>

        {interactive ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={shuffle}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 text-xs font-bold text-ink transition hover:border-rose"
            >
              <Shuffle className="size-3.5" />
              Shuffle
            </button>

            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 text-xs font-bold text-ink transition hover:border-rose"
            >
              <RotateCcw className="size-3.5" />
              Solve
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[1.75rem] border border-line bg-ink/5 p-1 shadow-[var(--shadow-paper)]">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          }}
        >
          {pieces.map((piece, currentIndex) => {
            const sourceColumn =
              piece.correctIndex % COLUMNS;

            const sourceRow = Math.floor(
              piece.correctIndex / COLUMNS,
            );

            const selected =
              selectedIndex === currentIndex;

            const correct =
              piece.correctIndex === currentIndex;

            const backgroundX =
              (sourceColumn / (COLUMNS - 1)) * 100;

            const backgroundY =
              (sourceRow / (ROWS - 1)) * 100;

            return (
              <button
                key={piece.id}
                type="button"
                disabled={!interactive || complete}
                onClick={() =>
                  selectPiece(currentIndex)
                }
                aria-label={`Puzzle piece ${currentIndex + 1}${
                  correct
                    ? ", correctly placed"
                    : ""
                }`}
                className={`relative overflow-hidden border border-paper/70 transition ${
                  interactive && !complete
                    ? "cursor-pointer hover:z-10 hover:scale-[1.03]"
                    : "cursor-default"
                } ${
                  selected
                    ? "z-20 scale-[1.04] ring-4 ring-rose"
                    : ""
                }`}
              >
                <span
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("${imageUrl}")`,
                    backgroundSize: `${COLUMNS * 100}% ${ROWS * 100}%`,
                    backgroundPosition: `${backgroundX}% ${backgroundY}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                />

                {correct && !complete ? (
                  <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-paper/90 text-berry shadow-sm">
                    <Check className="size-3" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {complete ? (
          <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/50 via-transparent to-transparent p-6">
            <div className="text-paper">
              <div className="flex items-center gap-2">
                <Puzzle className="size-5" />

                <span className="text-xs font-bold uppercase tracking-[0.16em]">
                  Puzzle complete
                </span>
              </div>

              <p className="serif mt-2 text-3xl font-semibold">
                {recipientName
                  ? `A memory for ${recipientName}`
                  : "A memory, piece by piece"}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {interactive && !complete ? (
        <p className="mx-auto mt-4 max-w-lg text-center text-xs leading-5 text-ink-muted">
          Select one piece and then another to swap their
          positions.
        </p>
      ) : null}
    </div>
  );
}