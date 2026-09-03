import { CinematicOverlay } from './components/UI/CinematicOverlay';
import { MainCanvas } from './components/Scene/MainCanvas';
import { SCENES } from './config/timeline';
import { COMPANY_INFO, METRICS, SERVICES } from './data/companyData';
import { useScrollProgress } from './hooks/useScrollProgress';

/**
 * The page is one long scroll track driving one continuous shot.
 *
 * Everything visual lives in a fixed layer; the tall spacer below exists only
 * to give the timeline something to run on. A full text transcript of the
 * journey sits underneath it for screen readers, crawlers and anyone who would
 * rather read than scroll.
 */
export default function App() {
  useScrollProgress();

  return (
    <div className="relative bg-[#0B0E10] text-[#F4F2EE]">
      <a href="#transcript" className="skip-link">
        Skip the animation and read the journey
      </a>

      <div className="fixed inset-0 z-0">
        <MainCanvas />
      </div>

      <CinematicOverlay />

      {/* Scroll track. 1600vh of travel gives the eight acts room to breathe. */}
      <div id="story" style={{ height: '1600vh' }} aria-hidden="true" />

      <main id="transcript" className="visually-hidden">
        <h1>{COMPANY_INFO.name} — {COMPANY_INFO.tagline}</h1>
        <p>{COMPANY_INFO.subheadline}</p>

        <h2>The journey, in seven chapters</h2>
        <ol>
          {SCENES.filter((scene) => scene.headline).map((scene) => (
            <li key={scene.id}>
              <h3>
                {scene.chapter} — {scene.chapterTitle}
              </h3>
              <p>{scene.caption}</p>
            </li>
          ))}
        </ol>

        <h2>Services</h2>
        <ul>
          {SERVICES.map((service) => (
            <li key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.tagline}</p>
              <p>{service.description}</p>
              <p>
                Capacity: {service.capacity}. Transit: {service.transitTime}.
              </p>
            </li>
          ))}
        </ul>

        <h2>By the numbers</h2>
        <ul>
          {METRICS.map((metric) => (
            <li key={metric.label}>
              {metric.value}
              {metric.suffix} {metric.label} — {metric.detail}
            </li>
          ))}
        </ul>

        <h2>Contact</h2>
        <address>
          <p>{COMPANY_INFO.legalName}</p>
          <p>{COMPANY_INFO.headquarters}</p>
          <p>
            <a href={'tel:' + COMPANY_INFO.phone.replace(/[^\d+]/g, '')}>{COMPANY_INFO.phone}</a>
          </p>
          <p>
            <a href={'mailto:' + COMPANY_INFO.email}>{COMPANY_INFO.email}</a>
          </p>
          <p>
            {COMPANY_INFO.dotNumber} · {COMPANY_INFO.mcNumber} · {COMPANY_INFO.operatingHours}
          </p>
        </address>
      </main>
    </div>
  );
}
