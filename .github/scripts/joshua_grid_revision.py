from __future__ import annotations

import sys
from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"Missing expected text for {label}")
    return text.replace(old, new, 1)


def revise(root: Path) -> None:
    index_path = root / "index.html"
    home = index_path.read_text(encoding="utf-8")
    home = replace_once(
        home,
        '<div class="button-desc">Get derezzed by the MCP. Review on Amazon.</div>',
        '<div class="button-desc">Lose to Joshua. Review on Amazon.</div>',
        "homepage caption",
    )
    index_path.write_text(home, encoding="utf-8")

    game_path = root / "tictactoe.html"
    game = game_path.read_text(encoding="utf-8")

    changes = [
        ("<title>Grid Duel: Tic-Tac-Toe</title>", "<title>Joshua's Grid Duel: Tic-Tac-Toe</title>", "title"),
        (
            'content="Enter an animated neon-grid Tic-Tac-Toe duel against the MCP. Survive the system and claim your reward."',
            'content="Challenge Joshua, the WOPR intelligence operating through an MCP-style Grid shell, in animated neon Tic-Tac-Toe."',
            "description",
        ),
        (
            '<meta property="og:title" content="Grid Duel: Tic-Tac-Toe">',
            '<meta property="og:title" content="Joshua\'s Grid Duel: Tic-Tac-Toe">',
            "open graph title",
        ),
        (
            'content="An original 1980s digital-grid arcade duel from the world of Life Lessons of a Man-Child."',
            'content="A WarGames-meets-digital-Grid arcade duel from the world of Life Lessons of a Man-Child."',
            "open graph description",
        ),
        (
            '<p class="eyebrow">LLoaMC Arcade Program // Sector 82</p>',
            '<p class="eyebrow">WOPR Simulation Link // Sector 82</p>',
            "eyebrow",
        ),
        (
            '<p class="subtitle">Tic-Tac-Toe against the MCP</p>',
            '<p class="subtitle">Tic-Tac-Toe against Joshua</p>\n        <div class="wopr-link" role="status"><span class="wopr-dot" aria-hidden="true"></span>WOPR ONLINE <span>//</span> JOSHUA <span>//</span> MCP GRID SHELL</div>',
            "subtitle",
        ),
        ("<span>GRID INTEGRITY</span>", "<span>GRID SIMULATION INTEGRITY</span>", "integrity label"),
        (
            '<p class="system-note">MCP countermeasures adapt after every completed grid. Persistence may reveal an anomaly.</p>',
            '<p class="system-note">Joshua\'s MCP countermeasures adapt after every completed grid. Persistence may reveal the flaw in the simulation.</p>',
            "system note",
        ),
        (
            '<p class="combatant-label">MASTER CONTROL PROGRAM</p>\n            <h2>MCP</h2>\n            <p>Perfect strategy. Relentless countermeasures. No known mercy protocol.</p>',
            '<p class="combatant-label">WOPR GAME PROGRAM // MCP SHELL</p>\n            <h2>JOSHUA</h2>\n            <p>Perfect game strategy operating through a relentless Master Control Program shell.</p>',
            "opponent panel",
        ),
        (
            '<p class="gate-code">SYSTEM HANDSHAKE // ORIGINAL GRID SCORE ENABLED</p>',
            '<p class="gate-code">WOPR LINK ESTABLISHED // MCP GRID SHELL ONLINE</p>',
            "gate code",
        ),
        ("<h2 id=\"gate-title\">ENTER THE GRID</h2>", "<h2 id=\"gate-title\">SHALL WE PLAY A GAME?</h2>", "gate title"),
        (
            '<p>You are the DISC program. The MCP controls the arena. The soundtrack and effects are an original synth composition generated inside your browser.</p>',
            '<p>You are the DISC program. Joshua is the WOPR intelligence controlling this arena through an MCP-style Grid shell. The soundtrack and effects are an original synth composition generated inside your browser.</p>',
            "gate copy",
        ),
        ("const AI = 'MCP';", "const AI = 'JOSHUA';", "AI name"),
        (
            "statusEl.textContent = 'SYSTEM ANOMALY DETECTED. MCP response matrix destabilizing.';",
            "statusEl.textContent = 'SYSTEM ANOMALY DETECTED. Joshua response matrix destabilizing.';",
            "critical status",
        ),
        (
            ": 'Your move, DISC. MCP countermeasures are active.';",
            ": \"Your move, DISC. Joshua's MCP countermeasures are active.\";",
            "default status",
        ),
        ("resultTitle.textContent = 'MCP DEFEATED';", "resultTitle.textContent = 'JOSHUA CONCEDES';", "human title"),
        (
            "resultCopy.textContent = 'You found the flaw in the system. Your prize is a passage out of the Grid and into one of the greatest computer-game movies of the 1980s.';",
            'resultCopy.textContent = "You found the flaw in Joshua\'s simulation. Your prize is a passage out of the Grid and into one of the greatest computer-game movies of the 1980s.";',
            "human copy",
        ),
        (
            "resultCode.textContent = 'PROGRAM DEREZZED // MCP VICTORIOUS';",
            "resultCode.textContent = 'PROGRAM DEREZZED // JOSHUA VICTORIOUS';",
            "AI result code",
        ),
        ("resultTitle.textContent = 'END OF LINE';", "resultTitle.textContent = 'JOSHUA WINS';", "AI title"),
        (
            "resultCopy.textContent = 'The MCP has terminated your program. Regroup with Life Lessons of a Man-Child before attempting another breach.';",
            'resultCopy.textContent = "Joshua\'s MCP shell has terminated your program. Regroup with Life Lessons of a Man-Child before attempting another simulation.";',
            "AI copy",
        ),
        (
            "updateStatus(percent <= 0 ? 'DRAW. Grid integrity collapsed. MCP vulnerability exposed.' : `DRAW. Grid integrity reduced to ${percent}%. Reinitializing…`);",
            "updateStatus(percent <= 0 ? 'DRAW. Grid integrity collapsed. Joshua vulnerability exposed.' : `DRAW. Grid integrity reduced to ${percent}%. Reinitializing…`);",
            "draw message",
        ),
        (
            "updateStatus(result.outcome === HUMAN ? 'Impossible result: user program has breached the MCP.' : 'MCP victory. User program derezzed.');",
            "updateStatus(result.outcome === HUMAN ? 'Joshua has recognized the flaw in the simulation.' : 'Joshua victory. User program derezzed.');",
            "end message",
        ),
        (
            "updateStatus('MCP calculating countermeasure…');",
            "updateStatus('Joshua calculating MCP countermeasure…');",
            "thinking message",
        ),
    ]

    for old, new, label in changes:
        game = replace_once(game, old, new, label)

    if ".wopr-link {" not in game:
        marker = "    @media (max-width: 900px) {"
        style = """    .wopr-link {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 13px;
      padding: 8px 11px;
      border: 1px solid rgba(124,255,155,.34);
      border-radius: 7px;
      color: #7cff9b;
      background: rgba(2, 18, 13, .7);
      box-shadow: inset 0 0 14px rgba(124,255,155,.05), 0 0 14px rgba(124,255,155,.06);
      font: 700 clamp(.52rem, 1.35vw, .66rem)/1.45 'Roboto Mono', monospace;
      letter-spacing: .11em;
      text-transform: uppercase;
    }
    .wopr-link span:not(.wopr-dot) { color: rgba(124,255,155,.48); }
    .wopr-dot {
      width: 8px;
      height: 8px;
      flex: 0 0 auto;
      border-radius: 50%;
      background: #7cff9b;
      box-shadow: 0 0 12px #7cff9b;
      animation: pulseGlow 1.35s ease-in-out infinite;
    }

"""
        if marker not in game:
            raise SystemExit("Missing responsive style marker")
        game = game.replace(marker, style + marker, 1)

    game_path.write_text(game, encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: joshua_grid_revision.py ROOT")
    revise(Path(sys.argv[1]))
