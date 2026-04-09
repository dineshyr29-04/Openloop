export const HeroOverlay = () => {
  return (
    <>
      <nav>
        <div className="nav-brand hud-label">OPENLOOP</div>
        <div className="nav-links">
          <a href="#hero">Core</a>
          <a href="#timeline">Timeline</a>
          <a href="#themes">Themes</a>
        </div>
        <button className="cta-outline" type="button">Try Now</button>
      </nav>

      <section id="hero">
        <h1 className="heading-primary hero-title">OPENLOOP</h1>

        <div className="hero-bottom-left">
          <p className="body-text-safe">
            Cinematic autonomous intelligence rendered in real time. Scroll to transition through systems, themes, and final state.
          </p>
          <button className="cta-button" type="button">Enter Loop</button>
        </div>

        <aside className="hero-bottom-right secondary-card">
          <span className="card-tag">UNIT PROFILE</span>
          <div className="card-image">
            <span className="hud-label">NOVA-7</span>
          </div>
          <h3>NOVA-7</h3>
          <p>
            Secondary synthetic entity synchronized with OPENLOOP phase telemetry and motion diagnostics.
          </p>
        </aside>
      </section>
    </>
  );
};
