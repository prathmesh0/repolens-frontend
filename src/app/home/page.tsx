'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import CustomButton from '@/components/CustomButton';
import { useAppContext } from '@/providers/AppContextProvider';

export default function HomePage() {
  const { handleLogout } = useAppContext();
  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-primary-foreground font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-20 mb-10 px-4 space-y-6">
        <h1 className="text-5xl font-semibold tracking-tight text-secondary-foreground">
          Welcome to Repolens
        </h1>
        <p className="max-w-2xl text-lg text-primary-foreground/50">
          Repolens empowers developers to analyze and understand their
          repositories using AI. Explore your codebase, view insightful reports,
          and chat with your intelligent assistant — all in one place.
        </p>
      </section>

      {/* Input Section */}
      <section className="flex items-center gap-3 mt-6 mb-20">
        <Input
          placeholder="Paste your repository URL..."
          className="w-96 border-input focus:ring-ring bg-card text-card-foreground placeholder-muted-foreground"
        />
        <Button className="bg-[oklch(0.5016_0.1887_27.4816)] text-primary-foreground  transition-all duration-300">
          Analyse
        </Button>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 mb-20">
        {[
          {
            title: 'AI Repository Insights',
            desc: "Get instant, intelligent breakdowns of your repo's structure and performance metrics using cutting-edge AI.",
          },
          {
            title: 'File Structure Visualizer',
            desc: 'Explore your project’s file hierarchy with clean, intuitive diagrams enriched with smart recommendations.',
          },
          {
            title: 'Chat with AI Assistant',
            desc: 'Interact directly with an AI trained to understand your project. Ask questions, get suggestions, and debug faster.',
          },
        ].map((feature, i) => (
          <Card
            key={i}
            className="bg-card text-card-foreground hover:scale-105 hover:shadow-xl transition-transform duration-300 ease-in-out rounded-lg border-border shadow-md p-2"
          >
            <CardContent className="space-y-3 p-6">
              <CardTitle className="text-xl font-medium text-[oklch(0.2393_0_0)]">
                {feature.title}
              </CardTitle>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <CustomButton onClick={handleLogout}>Logout</CustomButton>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-border text-muted-foreground text-sm">
        © {new Date().getFullYear()} Repolens. All rights reserved.
      </footer>
    </main>
  );
}
