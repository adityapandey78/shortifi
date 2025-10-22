import { Highlighter } from '@/components/ui/highlighter'

/**
 * Magic UI Highlighter Examples
 * Demonstrates all available annotation styles
 */

export function HighlighterDemo() {
  return (
    <div className="container mx-auto py-12 space-y-8 max-w-4xl">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Magic UI Highlighter Demo</h1>
        <p className="text-muted-foreground">
          All available annotation styles from rough-notation
        </p>
      </div>

      <div className="space-y-6">
        {/* Highlight */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Highlight</h3>
          <p className="text-lg leading-relaxed">
            This is a{" "}
            <Highlighter action="highlight" color="#FFD700" strokeWidth={3}>
              highlighted text
            </Highlighter>{" "}
            with yellow background effect.
          </p>
        </div>

        {/* Underline */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Underline</h3>
          <p className="text-lg leading-relaxed">
            This text has an{" "}
            <Highlighter action="underline" color="#FF6B6B" strokeWidth={3}>
              underline annotation
            </Highlighter>{" "}
            in red color.
          </p>
        </div>

        {/* Box */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Box</h3>
          <p className="text-lg leading-relaxed">
            This text is wrapped in a{" "}
            <Highlighter action="box" color="#4ECDC4" strokeWidth={2}>
              rectangular box
            </Highlighter>{" "}
            annotation.
          </p>
        </div>

        {/* Circle */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Circle</h3>
          <p className="text-lg leading-relaxed">
            This text has a{" "}
            <Highlighter action="circle" color="#95E1D3" strokeWidth={2}>
              circle around it
            </Highlighter>{" "}
            for emphasis.
          </p>
        </div>

        {/* Crossed-off */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Crossed Off</h3>
          <p className="text-lg leading-relaxed">
            This text is{" "}
            <Highlighter action="crossed-off" color="#FF8C94" strokeWidth={2}>
              crossed out
            </Highlighter>{" "}
            to show it's removed.
          </p>
        </div>

        {/* Strike-through */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Strike Through</h3>
          <p className="text-lg leading-relaxed">
            This text has a{" "}
            <Highlighter action="strike-through" color="#A8E6CF" strokeWidth={2}>
              strike-through line
            </Highlighter>{" "}
            through the middle.
          </p>
        </div>

        {/* Bracket */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Bracket</h3>
          <p className="text-lg leading-relaxed">
            This text has{" "}
            <Highlighter action="bracket" color="#B8B8D1" strokeWidth={2}>
              brackets on both sides
            </Highlighter>{" "}
            for grouping.
          </p>
        </div>

        {/* Multiple colors */}
        <div className="p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <h3 className="text-xl font-semibold mb-3">Combined Example</h3>
          <p className="text-lg leading-relaxed">
            Make your text{" "}
            <Highlighter action="highlight" color="#FFE66D" strokeWidth={3}>
              stand out
            </Highlighter>{" "}
            with{" "}
            <Highlighter action="underline" color="#FF6B6B" strokeWidth={3}>
              beautiful annotations
            </Highlighter>{" "}
            and{" "}
            <Highlighter action="circle" color="#4ECDC4" strokeWidth={2}>
              emphasis
            </Highlighter>
            !
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Powered by rough-notation library</p>
      </div>
    </div>
  )
}
