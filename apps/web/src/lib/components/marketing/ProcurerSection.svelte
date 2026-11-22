<section class="procurer-section" id="procurers" aria-labelledby="procurer-title">
  <div class="scene" aria-hidden="true">
  <div class="sun">
  </div>
  <div class="ribbon ribbon-a">
  </div>
  <div class="ribbon ribbon-b">
  </div>
  <div class="basket">
  <span>✳</span>
  <i>
  </i>
  <i>
  </i>
  <i>
  </i>
  </div>
  <div class="person">
  <span class="head">
  </span>
  <span class="body">
  </span>
  <span class="arm">
  </span>
  </div>
  <div class="scene-note">GOOD THINGS<br />ARE GROWING</div>
  </div>
  <div class="copy">
  <p class="eyebrow">For independent procurers</p>
  <h2 id="procurer-title">Know your streets.<br />
  <span>Grow your own business.</span>
  </h2>
  <p>Apply to become a Buytiva procurer. Our team reviews every application before an invitation is sent. You choose your approved coverage and see the service fee before accepting a request.</p>
  <a href="/apply/procurer">Apply to become a procurer <span aria-hidden="true">↗</span>
  </a>
  <a class="track" href="/application/status">Already applied? Track your application</a>
  </div>
</section>

<style>
  .procurer-section {
    display: grid;
    grid-template-columns: 1.02fr .98fr;
    align-items: center;
    gap: clamp(40px, 9vw, 130px);
    padding: clamp(80px, 11vw, 145px) clamp(24px, 9vw, 140px);
    color: white;
    background: var(--action-secondary);
  }
  .copy {
    max-width: 520px;
  }
  .eyebrow {
    color: var(--accent-lime);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
  }
  .copy h2 {
    margin: 18px 0;
    font: 700 clamp(39px, 5.5vw, 68px)/.98 'Space Grotesk', sans-serif;
    letter-spacing: -.065em;
  }
  .copy h2 span {
    color: var(--accent-orange);
  }
  .copy p:not(.eyebrow) {
    color: #d4deef;
    font-size: 17px;
    line-height: 1.65;
  }
  .copy > a:not(.track) {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    gap: 28px;
    min-height: 56px;
    margin-top: 17px;
    padding: 0 20px;
    border-radius: 9px;
    color: var(--action-secondary);
    background: var(--accent-lime);
    text-decoration: none;
    font-weight: 700;
  }
  .copy .track {
    display: block;
    width: fit-content;
    margin-top: 22px;
    color: white;
    font-size: 14px;
    text-underline-offset: 5px;
  }
  .scene {
    position: relative;
    min-height: 430px;
    overflow: hidden;
    border-radius: 28px;
    background: #f1b5a2;
  }
  .sun {
    position: absolute;
    top: 32px;
    right: 42px;
    width: 145px;
    height: 145px;
    border-radius: 50%;
    background: #ffdf87;
  }
  .ribbon {
    position: absolute;
    left: -20%;
    width: 140%;
    height: 125px;
    border: 3px solid #244ebc;
    border-radius: 50%;
    transform: rotate(-20deg);
  }
  .ribbon-a {
    top: 105px;
  }
  .ribbon-b {
    top: 230px;
    border-color: var(--primitive-coral-100);
    transform: rotate(18deg);
  }
  .basket {
    position: absolute;
    z-index: 1;
    right: 14%;
    bottom: 72px;
    display: grid;
    width: 152px;
    height: 116px;
    place-items: center;
    border-radius: 17px 17px 43px 43px;
    background: var(--accent-orange);
    transform: rotate(8deg);
    box-shadow: 0 17px 26px #8f49332e;
  }
  .basket span {
    position: absolute;
    top: -31px;
    left: 12px;
    color: var(--action-primary);
    font-size: 45px;
  }
  .basket i {
    position: absolute;
    width: 14px;
    height: 50px;
    border-radius: 12px;
    background: var(--accent-lime);
    transform: rotate(-25deg);
  }
  .basket i:nth-of-type(2) {
    left: 53px;
    background: var(--accent-coral);
    transform: rotate(18deg);
  }
  .basket i:nth-of-type(3) {
    left: 91px;
    background: var(--accent-lime);
    transform: rotate(-8deg);
  }
  .person {
    position: absolute;
    z-index: 2;
    left: 21%;
    bottom: 46px;
    width: 140px;
    height: 230px;
  }
  .head {
    position: absolute;
    left: 36px;
    top: 0;
    width: 78px;
    height: 80px;
    border: 8px solid #f1b5a2;
    border-radius: 43% 49% 46% 48%;
    background: #6a382b;
  }
  .body {
    position: absolute;
    bottom: 0;
    left: 10px;
    width: 125px;
    height: 153px;
    border-radius: 48px 48px 12px 12px;
    background: var(--action-primary);
  }
  .arm {
    position: absolute;
    top: 91px;
    right: -14px;
    width: 111px;
    height: 25px;
    border: 10px solid #c67d58;
    border-left: 0;
    border-radius: 0 20px 20px 0;
    transform: rotate(24deg);
  }
  .scene-note {
    position: absolute;
    top: 27px;
    left: 28px;
    color: var(--action-secondary);
    font: 700 11px/1.1 'Space Grotesk', sans-serif;
    letter-spacing: .08em;
  }
  @media (max-width: 800px) {
    .procurer-section {
      grid-template-columns: 1fr;
      gap: 40px;
      padding-inline: 24px;
    }
    .scene {
      order: 2;
      min-height: 320px;
    }
    .copy {
      order: 1;
    }
    .person {
      transform: scale(.8);
      transform-origin: bottom left;
    }
    .basket {
      right: 8%;
      bottom: 45px;
      transform: scale(.8) rotate(8deg);
      transform-origin: bottom right;
    }
  }
</style>
