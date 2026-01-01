'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DesignSchemePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Pinnacle Design System</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-12">
        {/* Color Palette */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Color Palette</h2>

          {/* Primary Colors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Primary Blue</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4">
              {[
                { shade: 50, className: 'bg-primary-50' },
                { shade: 100, className: 'bg-primary-100' },
                { shade: 200, className: 'bg-primary-200' },
                { shade: 300, className: 'bg-primary-300' },
                { shade: 400, className: 'bg-primary-400' },
                { shade: 500, className: 'bg-primary-500' },
                { shade: 600, className: 'bg-primary-600' },
                { shade: 700, className: 'bg-primary-700' },
                { shade: 800, className: 'bg-primary-800' },
                { shade: 900, className: 'bg-primary-900' },
              ].map(({ shade, className }) => (
                <div key={shade} className="space-y-2">
                  <div className={`h-20 rounded-lg border border-border ${className}`} />
                  <p className="text-sm font-medium text-center">primary-{shade}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Accent Teal/Cyan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4">
              {[
                { shade: 50, className: 'bg-accent-50' },
                { shade: 100, className: 'bg-accent-100', hexCode: '#E9FBF7' },
                { shade: 200, className: 'bg-accent-200' },
                { shade: 300, className: 'bg-accent-300' },
                { shade: 400, className: 'bg-accent-400' },
                { shade: 500, className: 'bg-accent-500', hexCode: '#22C1A6' },
                { shade: 600, className: 'bg-accent-600', hexCode: '#1AA38C' },
                { shade: 700, className: 'bg-accent-700' },
                { shade: 800, className: 'bg-accent-800' },
                { shade: 900, className: 'bg-accent-900' },
              ].map(({ shade, className, hexCode }) => (
                <div key={shade} className="space-y-2">
                  <div className={`h-20 rounded-lg border border-border ${className}`} />
                  <p className="text-sm font-medium text-center">
                    accent-{shade}
                    {hexCode && (
                      <span className="block text-xs text-muted-foreground">{hexCode}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Neutral Colors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Neutral Cool Grays</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-11 gap-4">
              {[
                { shade: 50, className: 'bg-neutral-50' },
                { shade: 100, className: 'bg-neutral-100' },
                { shade: 200, className: 'bg-neutral-200' },
                { shade: 300, className: 'bg-neutral-300' },
                { shade: 400, className: 'bg-neutral-400' },
                { shade: 500, className: 'bg-neutral-500' },
                { shade: 600, className: 'bg-neutral-600' },
                { shade: 700, className: 'bg-neutral-700' },
                { shade: 800, className: 'bg-neutral-800' },
                { shade: 900, className: 'bg-neutral-900' },
                { shade: 950, className: 'bg-neutral-950' },
              ].map(({ shade, className }) => (
                <div key={shade} className="space-y-2">
                  <div className={`h-20 rounded-lg border border-border ${className}`} />
                  <p className="text-sm font-medium text-center">neutral-{shade}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Semantic Colors</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-success flex items-center justify-center">
                  <span className="text-success-foreground font-medium">Success</span>
                </div>
                <p className="text-sm text-center">#16A34A</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-warning flex items-center justify-center">
                  <span className="text-warning-foreground font-medium">Warning</span>
                </div>
                <p className="text-sm text-center">#D4A017</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-error flex items-center justify-center">
                  <span className="text-error-foreground font-medium">Error</span>
                </div>
                <p className="text-sm text-center">#DC2626</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-info flex items-center justify-center">
                  <span className="text-info-foreground font-medium">Info</span>
                </div>
                <p className="text-sm text-center">Blue-tinted</p>
              </div>
            </div>
          </div>

          {/* Theme Colors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Theme Colors</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-background border border-border flex items-center justify-center">
                  <span className="text-foreground font-medium">Background</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-card border border-border flex items-center justify-center">
                  <span className="text-card-foreground font-medium">Card</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">Primary</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-secondary-foreground font-medium">Secondary</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">Muted</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-medium">Accent</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Typography</h2>

          <div className="space-y-6 bg-card p-6 rounded-lg border border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Font Family: Inter</p>
              <p className="text-base">The quick brown fox jumps over the lazy dog</p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-xl font-semibold mb-4">Text Hierarchy</h3>
              <div className="space-y-4">
                <div>
                  <h1 className="mb-1">Heading 1 - 4xl Bold</h1>
                  <p className="text-sm text-muted-foreground">
                    text-4xl font-bold (2.25rem / 36px)
                  </p>
                </div>
                <div>
                  <h2 className="mb-1">Heading 2 - 3xl Bold</h2>
                  <p className="text-sm text-muted-foreground">
                    text-3xl font-bold (1.875rem / 30px)
                  </p>
                </div>
                <div>
                  <h3 className="mb-1">Heading 3 - 2xl Semibold</h3>
                  <p className="text-sm text-muted-foreground">
                    text-2xl font-semibold (1.5rem / 24px)
                  </p>
                </div>
                <div>
                  <p className="text-xl mb-1">Text XL - 1.25rem</p>
                  <p className="text-sm text-muted-foreground">text-xl (1.25rem / 20px)</p>
                </div>
                <div>
                  <p className="text-lg mb-1">Text LG - 1.125rem</p>
                  <p className="text-sm text-muted-foreground">text-lg (1.125rem / 18px)</p>
                </div>
                <div>
                  <p className="text-base mb-1">Body Text - 1rem (Base)</p>
                  <p className="text-sm text-muted-foreground">text-base (1rem / 16px)</p>
                </div>
                <div>
                  <p className="text-sm mb-1">Caption Text - 0.875rem</p>
                  <p className="text-xs text-muted-foreground">text-sm (0.875rem / 14px)</p>
                </div>
                <div>
                  <p className="text-xs mb-1">Extra Small - 0.75rem</p>
                  <p className="text-xs text-muted-foreground">text-xs (0.75rem / 12px)</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-xl font-semibold mb-4">Font Weights</h3>
              <div className="space-y-2">
                <p className="font-regular">Regular (400) - The quick brown fox</p>
                <p className="font-medium">Medium (500) - The quick brown fox</p>
                <p className="font-semibold">Semibold (600) - The quick brown fox</p>
                <p className="font-bold">Bold (700) - The quick brown fox</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Buttons</h2>

          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="accent">Accent (CTA)</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Semantic Variants */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Semantic Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="destructive">Error/Destructive</Button>
                <Button variant="info">Info</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="accent" size="sm">
                  Small
                </Button>
                <Button variant="accent" size="default">
                  Default
                </Button>
                <Button variant="accent" size="lg">
                  Large
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-xl font-semibold mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="accent">Normal</Button>
                <Button variant="accent" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Icon Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="accent" size="icon-sm">
                  <span className="text-xs">S</span>
                </Button>
                <Button variant="accent" size="icon">
                  <span className="text-sm">M</span>
                </Button>
                <Button variant="accent" size="icon-lg">
                  <span className="text-base">L</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Spacing (8px Grid System)</h2>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="space-y-4">
              {[
                { value: '0.5', px: '4px', rem: '0.25rem' },
                { value: '1', px: '8px', rem: '0.5rem' },
                { value: '2', px: '16px', rem: '1rem' },
                { value: '3', px: '24px', rem: '1.5rem' },
                { value: '4', px: '32px', rem: '2rem' },
                { value: '5', px: '40px', rem: '2.5rem' },
                { value: '6', px: '48px', rem: '3rem' },
                { value: '8', px: '64px', rem: '4rem' },
                { value: '10', px: '80px', rem: '5rem' },
                { value: '12', px: '96px', rem: '6rem' },
              ].map((space) => (
                <div key={space.value} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{space.value}</div>
                  <div className="w-32 text-sm text-muted-foreground">{space.px}</div>
                  <div className="w-32 text-sm text-muted-foreground">{space.rem}</div>
                  <div className="flex-1">
                    <div className={`h-8 bg-accent-500 rounded`} style={{ width: space.px }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cards and Components */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Card */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-2">Basic Card</h3>
              <p className="text-sm text-muted-foreground">
                This is a basic card component with default styling.
              </p>
            </div>

            {/* Elevated Card */}
            <div className="bg-card rounded-lg border border-border shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Elevated Card</h3>
              <p className="text-sm text-muted-foreground">
                Card with shadow for elevated appearance.
              </p>
            </div>

            {/* Accent Card */}
            <div className="bg-accent-100 dark:bg-accent-900/10 rounded-lg border border-accent-200 p-6">
              <h3 className="text-lg font-semibold mb-2">Accent Card</h3>
              <p className="text-sm text-muted-foreground">Card with subtle accent background.</p>
            </div>
          </div>
        </section>

        {/* Status Badges */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Status Badges</h2>

          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success border border-success/20">
              Success
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning border border-warning/20">
              Warning
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error/10 text-error border border-error/20">
              Error
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info/10 text-info border border-info/20">
              Info
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 text-accent-900 border border-accent-200">
              Accent
            </span>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="bg-card p-8 rounded-lg border border-border">
          <h2 className="text-3xl font-bold mb-6">Usage Guidelines</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Primary CTAs</h3>
              <p className="text-muted-foreground">
                Use{' '}
                <code className="px-2 py-1 bg-accent-100 dark:bg-accent-900/10 rounded text-accent-900 dark:text-accent-100">
                  bg-accent-500
                </code>{' '}
                for primary call-to-action buttons with{' '}
                <code className="px-2 py-1 bg-accent-100 dark:bg-accent-900/10 rounded text-accent-900 dark:text-accent-100">
                  hover:bg-accent-600
                </code>{' '}
                state.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Subtle Backgrounds</h3>
              <p className="text-muted-foreground">
                Use{' '}
                <code className="px-2 py-1 bg-accent-100 dark:bg-accent-900/10 rounded text-accent-900 dark:text-accent-100">
                  bg-accent-100
                </code>{' '}
                for tags, progress fills, and subtle highlights.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Typography</h3>
              <p className="text-muted-foreground">
                All text uses the Inter font family with font feature settings for improved
                legibility.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Spacing</h3>
              <p className="text-muted-foreground">
                Maintain strict 8px grid system for all layout, padding, and component rhythm.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
