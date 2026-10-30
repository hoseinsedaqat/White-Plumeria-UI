import { planFromPrompt, type PlanResult, type PreviewNode } from '@white-plumeria/ai';
import {
  Alert,
  Badge,
  Button,
  Calendar,
  Card,
  ChartContainer,
  DatePicker,
  DateRangePicker,
  RangeSlider,
  EmptyState,
  Input,
  PageHeader,
  Select,
  StatCard,
  Switch,
  useWhitePlumeria,
} from '@white-plumeria/react';
import { useState } from 'react';
import { CodeBlock } from '../copy.tsx';
import { ThemedFrame } from '../preview.tsx';
import { A, useRoute } from '../router.tsx';

const starter = 'Build a finance dashboard with a dark theme, stat cards, and an alert.';

export function AiPage() {
  const { setPreferences } = useWhitePlumeria();
  const { navigate } = useRoute();
  const [prompt, setPrompt] = useState(starter);
  const [framework, setFramework] = useState<'react' | 'vue' | 'svelte' | 'angular' | 'solid' | 'preact' | 'qwik' | 'lit' | 'html'>('react');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<PlanResult | null>(null);

  function run() {
    try {
      const next = planFromPrompt({ prompt, locale: 'en' });
      setPlan(next);
      setError('');
      if (next.analysis.theme) setPreferences({ theme: next.analysis.theme });
      if (next.analysis.appearance) setPreferences({ appearance: next.analysis.appearance });
    } catch (caught) {
      setPlan(null);
      setError(caught instanceof Error ? caught.message : 'Planning failed.');
    }
  }

  return (
    <article className="docs-article">
      <p className="docs-kicker">Local planner</p>
      <h1 className="docs-title">Studio without a key</h1>
      <p className="docs-lede">
        This page does not call a cloud model. It plans from the real catalog and does not execute generated code.
      </p>
      <label className="wpl-label" htmlFor="ai-prompt">
        Prompt
      </label>
      <textarea id="ai-prompt" className="wpl-textarea" rows={4} value={prompt} onChange={(event) => setPrompt(event.currentTarget.value)} />
      <div className="wpl-cluster" style={{ marginBlock: '0.8rem' }}>
        <Button onClick={run}>Plan</Button>
        <span className="wpl-muted">LocalDeterministicProvider</span>
      </div>
      {error ? (
        <Alert variant="danger" title="Planner error">
          {error}
        </Alert>
      ) : null}
      {plan ? (
        <div className="docs-section">
          <h2>Recommendations</h2>
          <ul>
            {plan.analysis.recommendations.map((item) => (
              <li key={item.slug}>
                <A href={`/components/${item.slug}`} onNavigate={navigate}>
                  {item.component}
                </A>{' '}
                — {item.reason}
              </li>
            ))}
          </ul>
          <h2>Safe preview</h2>
          <ThemedFrame className="docs-stage">
            <Preview nodes={plan.layout.nodes} />
          </ThemedFrame>
          <div className="docs-tabs">
            {(['react', 'vue', 'svelte', 'angular', 'solid', 'preact', 'qwik', 'lit', 'html'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={framework === item ? 'wpl-btn wpl-btn-primary wpl-btn-sm' : 'wpl-btn wpl-btn-ghost wpl-btn-sm'}
                onClick={() => setFramework(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <CodeBlock code={plan.code[framework].files[0]?.contents ?? ''} />
          <p>
            Validation:{' '}
            {plan.validation[framework].ok ? (
              <Badge variant="success">passed</Badge>
            ) : (
              <Badge variant="danger">failed</Badge>
            )}
          </p>
          {plan.validation[framework].errors.map((item) => (
            <p key={item} className="wpl-field-error" role="alert">
              {item}
            </p>
          ))}
          <h2>Limitations</h2>
          <ul>
            {plan.analysis.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function Preview({ nodes }: { nodes: PreviewNode[] }) {
  return (
    <div className="wpl-stack">
      {nodes.map((node, index) => (
        <PreviewNodeView key={`${node.component}-${index}`} node={node} />
      ))}
    </div>
  );
}

function textProp(node: PreviewNode, key: string, fallback = ''): string {
  const value = node.props?.[key];
  return value === undefined ? fallback : String(value);
}

function PreviewNodeView({ node }: { node: PreviewNode }) {
  if (node.component === 'PageHeader') {
    return <PageHeader title={textProp(node, 'title', 'Untitled')} description={textProp(node, 'description')} />;
  }
  if (node.component === 'StatCard') {
    return <StatCard label={textProp(node, 'label')} value={textProp(node, 'value')} hint={textProp(node, 'hint')} />;
  }
  if (node.component === 'Grid') {
    return (
      <div className="wpl-grid wpl-grid-3">
        {node.children?.map((child, index) => (
          <PreviewNodeView key={index} node={child} />
        ))}
      </div>
    );
  }
  if (node.component === 'Alert') {
    return (
      <Alert variant="info" title={textProp(node, 'title', 'Note')}>
        {node.text}
      </Alert>
    );
  }
  if (node.component === 'Card') {
    return (
      <Card title={textProp(node, 'title')} description={textProp(node, 'description')}>
        {node.text}
        {node.children?.map((child, index) => (
          <PreviewNodeView key={index} node={child} />
        ))}
      </Card>
    );
  }
  if (node.component === 'Button') return <Button>{node.text ?? 'Action'}</Button>;
  if (node.component === 'Badge') return <Badge>{node.text ?? 'Sample'}</Badge>;
  if (node.component === 'Input') return <Input placeholder={textProp(node, 'placeholder', 'Sample')} />;
  if (node.component === 'Switch') return <Switch label={textProp(node, 'label', 'Setting')} />;
  if (node.component === 'Select') {
    return <Select aria-label={textProp(node, 'label', 'Select')} options={[{ value: 'ivory', label: 'Ivory' }]} />;
  }
  if (node.component === 'FormField') {
    return (
      <p className="wpl-muted">
        FormField “{textProp(node, 'label', 'Field')}” is planned. The input beside it is the real control.
      </p>
    );
  }
  if (node.component === 'EmptyState') {
    return (
      <EmptyState title={textProp(node, 'title', 'Empty')} description={textProp(node, 'description')}>
        {node.children?.map((child, index) => (
          <PreviewNodeView key={index} node={child} />
        ))}
      </EmptyState>
    );
  }
  if (node.component === 'ChartContainer') {
    return (
      <ChartContainer
        title={textProp(node, 'title', 'Sample volume')}
        description="Fixture values for the preview, not live metrics."
        data={[
          { label: 'Mon', value: 12 },
          { label: 'Tue', value: 18 },
          { label: 'Wed', value: 9 },
        ]}
      />
    );
  }
  if (node.component === 'DatePicker') return <DatePicker label={textProp(node, 'label', 'Date')} value={textProp(node, 'value')} />;
  if (node.component === 'DateRangePicker') {
    return (
      <DateRangePicker
        label={textProp(node, 'label', 'Stay')}
        start={textProp(node, 'start', '2026-10-12')}
        end={textProp(node, 'end', '2026-10-18')}
        showTime={node.props?.showTime === true}
        startTime={textProp(node, 'startTime', '09:00')}
        endTime={textProp(node, 'endTime', '18:00')}
      />
    );
  }
  if (node.component === 'RangeSlider') {
    return (
      <RangeSlider
        label={textProp(node, 'label', 'Price')}
        min={Number(textProp(node, 'min', '0'))}
        max={Number(textProp(node, 'max', '500'))}
        step={Number(textProp(node, 'step', '10'))}
        defaultStart={Number(textProp(node, 'start', '80'))}
        defaultEnd={Number(textProp(node, 'end', '320'))}
      />
    );
  }
  if (node.component === 'Calendar') return <Calendar />;
  if (node.component === 'Dialog') {
    return <Alert title={textProp(node, 'title', 'Dialog')}>{node.text} Open the Dialog catalog page to trap focus.</Alert>;
  }
  return <p className="wpl-muted">{node.component} is in the plan. Open its catalog page for the interactive demo.</p>;
}
