import React, { useMemo } from 'react';
import { getPatternSkillById, PATTERN_SKILLS } from '../../patterns/patternSkillCatalog.js';
import { buildPatternDiagnosticBridgeFromRoute } from '../../patterns/patternDiagnosticHandoff.js';

const STATE_LABELS = {
  unknown: 'More evidence needed',
  not_ready: 'Review recommended',
  supported: 'Can do with support',
  independent: 'Independent evidence',
  secure: 'Secure evidence'
};

const REASON_LABELS = {
  unknown_evidence: 'Check this skill with more evidence',
  demonstrated_gap: 'Build this prerequisite before moving on',
  supported_needs_independence: 'Practise this skill without support',
  verify_target_after_bridge: 'Recheck this target after bridge work'
};

export function PatternDiagnosticBridge({ route }) {
  const resolved = useMemo(() => {
    try {
      return { value: buildPatternDiagnosticBridgeFromRoute(route), error: '' };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : 'Invalid diagnostic handoff' };
    }
  }, [route]);

  if (!resolved.value) {
    return (
      <BridgeShell>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h1 className="serif text-3xl font-bold text-red-900">Patterns bridge unavailable</h1>
          <p className="mt-3 text-sm text-red-800">The diagnostic handoff could not be validated. No learner evidence was saved or changed.</p>
          <p className="mt-2 break-all text-xs text-red-700">{resolved.error}</p>
          <HomeActions />
        </div>
      </BridgeShell>
    );
  }

  const { learnerEvidence, bridgePlan, attempts } = resolved.value;
  const bridgeWork = bridgePlan.units.filter((unit) => unit.unitType !== 'readiness_check');
  const readiness = bridgePlan.units.filter((unit) => unit.unitType === 'readiness_check');

  return (
    <BridgeShell>
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Patterns diagnostic → learning bridge</div>
        <h1 className="serif mt-2 text-4xl font-bold text-slate-950">Your next learning steps</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          This plan uses only the {attempts.length} attempts from the diagnostic run you just handed over from Kani. It is placement evidence, not a mastery score or ability label.
        </p>
        <div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-950">
          No support or capacity profile was inferred from correctness. M004 passes an empty support profile into the existing M001 planner.
        </div>
      </header>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Observed evidence</div>
            <h2 className="serif mt-1 text-2xl font-bold text-slate-950">What the diagnostic actually showed</h2>
          </div>
          <div className="text-sm text-slate-500">No diagnostic state is promoted to secure.</div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {PATTERN_SKILLS.map((skill) => {
            const evidence = learnerEvidence.skills[skill.id];
            return (
              <div key={skill.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-bold text-slate-900">{skill.title}</div>
                <div className="mt-1 text-sm font-semibold text-indigo-700">{STATE_LABELS[evidence.state] || evidence.state}</div>
                <div className="mt-2 text-xs text-slate-500">
                  {evidence.attemptCount} probe{evidence.attemptCount === 1 ? '' : 's'} · {evidence.independentCorrect} independent correct
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Explainable bridge</div>
        <h2 className="serif mt-1 text-2xl font-bold text-slate-950">Start here</h2>
        <p className="mt-2 text-sm text-slate-600">The sequence below comes from the explicit prerequisite graph plus the evidence states above.</p>

        {bridgeWork.length === 0 ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
            This diagnostic produced no immediate probe, instruction, or supported-practice bridge units. Continue with target checks rather than treating this as proof of long-term mastery.
          </div>
        ) : (
          <ol className="mt-5 space-y-3">
            {bridgeWork.map((unit, index) => {
              const skill = getPatternSkillById(unit.skillId);
              return (
                <li key={`${unit.skillId}_${unit.unitType}`} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 font-black text-white">{index + 1}</div>
                  <div>
                    <div className="font-bold text-slate-950">{skill?.title || unit.skillId}</div>
                    <div className="mt-1 text-sm text-slate-700">{REASON_LABELS[unit.reasonCode] || unit.reasonCode}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{unit.unitType.replace('_', ' ')}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {readiness.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="font-bold text-amber-950">Then verify the target</div>
            <div className="mt-1 text-sm text-amber-900">
              {readiness.length} readiness check{readiness.length === 1 ? '' : 's'} follow the bridge work. These are checks, not a mastery percentage.
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Summary label="Probe" value={bridgePlan.summary.probeCount} />
          <Summary label="Instruction" value={bridgePlan.summary.instructionCount} />
          <Summary label="Practice" value={bridgePlan.summary.practiceCount} />
          <Summary label="Readiness" value={bridgePlan.summary.readinessCheckCount} />
        </div>
      </section>

      <HomeActions />
    </BridgeShell>
  );
}

function BridgeShell({ children }) {
  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900"><div className="mx-auto max-w-6xl">{children}</div></main>;
}

function Summary({ label, value }) {
  return <div className="rounded-2xl bg-slate-100 p-4"><div className="text-xs font-bold uppercase text-slate-500">{label}</div><div className="mt-1 text-2xl font-black">{value}</div></div>;
}

function HomeActions() {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button type="button" onClick={() => window.history.back()} className="rounded-full bg-slate-900 px-5 py-2.5 font-bold text-white">← Back</button>
      <button type="button" onClick={() => { window.location.hash = '#/'; }} className="rounded-full border border-slate-400 bg-white px-5 py-2.5 font-bold text-slate-800">Study-Hub home</button>
    </div>
  );
}
