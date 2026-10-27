import { japaneseText as ___bsJa } from "../../../localization/displayLanguage.js";
import CoreArea from "../../../components/cards/CoreArea.jsx";
import "../../../styles/arena/coreSystemV490.css";

function SoulCoreDisplay({ active = false }) {
  return (
    <span
      className={`arena-soul-core-indicator ${active ? "is-present" : ""}`}
      aria-label={active ? ___bsJa("Soul Core present", "ソウルコアプレゼント") : ___bsJa("Soul Core absent", "ソウルコアが存在しない")}
      title={___bsJa("Soul Core", "ソウルコア")}
    >
      <i aria-hidden="true">S</i>
      <small>{___bsJa("Soul Core", "ソウルコア")}</small>
    </span>
  );
}

function CoreResourceDisplay({
  title,
  playerId,
  zone,
  regularCount = 0,
  soul = false,
  canControl = false,
  onCoreDrop,
  onCoreClick,
  accent = "reserve",
  guidance = null,
  role = "resource"
}) {
  return (
    <section
      className={`arena-core-display arena-core-display-${role}`}
      data-arena-component="CoreDisplay"
      data-core-zone={zone}
    >
      <header className="arena-core-display-header">
        <div>
          <span>{title}</span>
          <b>{Number(regularCount || 0) + (soul ? 1 : 0)}</b>
        </div>
        <SoulCoreDisplay active={soul} />
      </header>

      <div className="arena-core-stack" data-arena-component="CoreStack">
        <CoreArea
          title={title}
          playerId={playerId}
          zone={zone}
          regularCount={regularCount}
          soul={soul}
          canControl={canControl}
          onCoreDrop={onCoreDrop}
          onCoreClick={onCoreClick}
          accent={accent}
          guidance={guidance}
        />
      </div>
    </section>
  );
}

export function ReserveCoreDisplay(props) {
  return <CoreResourceDisplay {...props} role="reserve" zone="reserve" accent="reserve" />;
}

export function CoreTrashDisplay(props) {
  return <CoreResourceDisplay {...props} role="trash" zone="trash" accent="trash" />;
}

export function VoidCoreDisplay() {
  return (
    <div className="arena-void-core-display" data-arena-component="VoidCoreDisplay" title={___bsJa("Void", "ボイド")}>
      <span aria-hidden="true">∞</span>
      <small>{___bsJa("Void", "ボイド")}</small>
    </div>
  );
}

export { SoulCoreDisplay };
