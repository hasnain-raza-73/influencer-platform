'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function HomePage() {
  const router = useRouter()
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate marquee
    const marquee = marqueeRef.current
    if (!marquee) return

    const animate = () => {
      if (marquee.scrollLeft >= marquee.scrollWidth / 2) {
        marquee.scrollLeft = 0
      } else {
        marquee.scrollLeft += 0.5
      }
    }

    const interval = setInterval(animate, 20)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* Sticky Navigation */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background-light/80 dark:bg-background-dark/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span className="material-symbols-outlined text-2xl">hub</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
              InfluencerPlatform
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">Features</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">For Brands</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">For Influencers</a>
            <a onClick={() => router.push('/auth/login')} className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">Sign In</a>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/auth/register')}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Trusted Performance Marketing
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Connect brands with <span className="text-primary">influential influencers</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                The complete influencer marketing platform for launching campaigns, tracking performance, and managing commissions. Built for brands and influencers who want measurable results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 aspect-square">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800')",
                  }}
                ></div>
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-900">Active Campaign</span>
                    <span className="text-emerald-500 font-bold text-sm">1,247 clicks</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[65%]"></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">65%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar Marquee */}
        <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">
            Trusted by Global Industry Leaders
          </p>
          <div
            ref={marqueeRef}
            className="flex overflow-hidden gap-16 grayscale opacity-50"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="flex items-center gap-16 flex-shrink-0">
              <img
                alt="Nike Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg"
              />
              <img
                alt="Amazon Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
              />
              <img
                alt="Samsung Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg"
              />
              <img
                alt="Netflix Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
              />
              <img
                alt="Sony Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg"
              />
              <img
                alt="Meta Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
              />
            </div>
            <div className="flex items-center gap-16 flex-shrink-0">
              <img
                alt="Nike Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg"
              />
              <img
                alt="Amazon Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
              />
              <img
                alt="Samsung Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg"
              />
              <img
                alt="Netflix Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
              />
              <img
                alt="Sony Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg"
              />
              <img
                alt="Meta Logo"
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
              />
            </div>
          </div>
        </section>

        {/* Key Features Sections */}
        <section className="py-24 space-y-32">
          {/* Feature 1 */}
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div
              className="rounded-xl overflow-hidden shadow-2xl aspect-video bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800')",
              }}
            ></div>
            <div className="space-y-6">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Campaign Management</span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                Launch campaigns with precision targeting
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Create targeted campaigns with custom commission rates, budgets, and product selections. Choose between open campaigns for all influencers or invitation-only campaigns for select influencers.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
                  <span className="font-medium">Custom commission rates and budgets</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
                  <span className="font-medium">Open or invitation-only campaigns</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Tracking & Analytics</span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                Track every click and conversion in real-time
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Advanced tracking links with QR codes, UTM parameters, and custom slugs. Monitor clicks, conversions, and revenue with detailed analytics including device type, location, and referrer data.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-primary font-bold flex items-center gap-2 group"
                >
                  Start tracking now{' '}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
            <div
              className="order-1 lg:order-2 rounded-xl overflow-hidden shadow-2xl aspect-video bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800')",
              }}
            ></div>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Everything you need to succeed
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Built for performance marketers who need accurate tracking, transparent reporting, and reliable payouts.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">link</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Smart Tracking Links</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Generate unique tracking links with QR codes, custom slugs, and UTM parameters. Track every click with detailed analytics on device type, location, and referrer.
                </p>
              </div>
              <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">payments</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Automated Payouts</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Influencers can request payouts once they reach the minimum threshold. Track pending, approved, and paid commissions with complete transparency.
                </p>
              </div>
              <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">insights</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Real-Time Analytics</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Monitor campaign performance with live dashboards showing clicks, conversions, revenue, and ROI. Filter by date range, device type, and more.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <span className="material-symbols-outlined text-6xl text-primary/20 mb-8">format_quote</span>
            <blockquote className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white italic leading-tight mb-12">
              "The tracking and analytics features are incredibly detailed. We can see exactly which influencers drive the most conversions and optimize our campaigns accordingly. It's transformed our approach to influencer marketing."
            </blockquote>
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800 mb-4 bg-cover bg-center shadow-xl"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200')",
                }}
              ></div>
              <p className="font-bold text-lg text-slate-900 dark:text-white">Sarah Jenkins</p>
              <p className="text-slate-500 dark:text-slate-400 mb-6 uppercase text-sm font-bold tracking-widest">
                Marketing Director, E-commerce Brand
              </p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-32 bg-slate-900 dark:bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 opacity-50"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl lg:text-7xl font-black mb-8">Ready to get started?</h2>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              Join brands and influencers using our platform to launch campaigns, track performance, and grow revenue. Free to get started.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={() => router.push('/auth/register')}
                className="px-12 py-5 bg-primary text-white rounded-xl font-bold text-xl hover:scale-105 transition-all shadow-2xl shadow-primary/40"
              >
                Create Free Account
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="px-12 py-5 bg-slate-800 text-white rounded-xl font-bold text-xl hover:bg-slate-700 transition-all border border-slate-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <span className="material-symbols-outlined text-xl">hub</span>
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                  InfluencerPlatform
                </h2>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Complete influencer marketing platform with campaign management, performance tracking, and automated payouts.
              </p>
              <div className="flex gap-4">
                <a className="text-slate-400 hover:text-primary cursor-pointer">
                  <span className="material-symbols-outlined">public</span>
                </a>
                <a className="text-slate-400 hover:text-primary cursor-pointer">
                  <span className="material-symbols-outlined">group</span>
                </a>
                <a className="text-slate-400 hover:text-primary cursor-pointer">
                  <span className="material-symbols-outlined">send</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">For Brands</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li>
                  <a onClick={() => router.push('/auth/register')} className="hover:text-primary cursor-pointer">Create Campaign</a>
                </li>
                <li>
                  <a className="hover:text-primary cursor-pointer">Find Influencers</a>
                </li>
                <li>
                  <a className="hover:text-primary cursor-pointer">Analytics</a>
                </li>
                <li>
                  <a className="hover:text-primary cursor-pointer">Product Management</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">For Influencers</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li>
                  <a onClick={() => router.push('/auth/register')} className="hover:text-primary cursor-pointer">Browse Campaigns</a>
                </li>
                <li>
                  <a className="hover:text-primary cursor-pointer">Tracking Links</a>
                </li>
                <li>
                  <a className="hover:text-primary cursor-pointer">Earnings</a>
                </li>
                <li>
                  <a className="hover:text-primary cursor-pointer">Payouts</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a className="hover:text-primary cursor-pointer">Security</a>
                </li>
                <li>
                  <a className="hover:text-primary cursor-pointer">Ethics</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-xs">© 2024 InfluencerPlatform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span className="material-symbols-outlined text-sm">language</span> English (US)
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span className="material-symbols-outlined text-sm">payments</span> USD
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
