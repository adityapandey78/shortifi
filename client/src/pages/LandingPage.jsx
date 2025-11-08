import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Link2, Zap, BarChart3, Shield, Globe, Sparkles, 
  ChevronDown, Check, Mail, MessageSquare, Send,
  TrendingUp, Users, Target, Award, Clock, Database,
  Share2, AtSign, QrCode, MousePointerClick, Twitter,
  Github, Linkedin
} from 'lucide-react'
import * as RadixIcons from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Prism from '@/components/Prism'
import ColorBends from '@/components/ColorBends'
import Iridescence from '@/components/Iridescence'
import MagicBento from '@/components/MagicBento'
import { AuroraText } from '@/components/ui/aurora-text'
import { SparklesText } from '@/components/ui/sparkles-text'
import { useToast } from '@/hooks/use-toast'
import { useStore } from '@/store/useStore'
import { Footer } from '@/components/Footer'

/**
 * Landing Page Component
 * Modern SaaS landing page with React Bits components
 */
export function LandingPage() {
  const { toast } = useToast()
  const { isAuthenticated } = useStore()
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })

  const handleContactSubmit = (e) => {
    e.preventDefault()
    toast({
      title: 'Message Sent!',
      description: 'We\'ll get back to you soon.',
    })
    setContactForm({ name: '', email: '', message: '' })
  }

  // Features for Gather-style section
  const paymentsData = [
    { name: 'Social Media', amount: '2.4K clicks', icon: <Share2 className="h-5 w-5" /> },
    { name: 'Email Campaigns', amount: '1.8K clicks', icon: <AtSign className="h-5 w-5" /> },
    { name: 'QR Codes', amount: '890 scans', icon: <QrCode className="h-5 w-5" /> },
    { name: 'Direct Traffic', amount: '670 visits', icon: <MousePointerClick className="h-5 w-5" /> },
  ]

  const teamMembers = [
    { name: 'Marketing Team', role: '156 links', icon: <TrendingUp className="h-5 w-5" /> },
    { name: 'Sales Team', role: '98 links', icon: <Target className="h-5 w-5" /> },
    { name: 'Support Team', role: '67 links', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Product Team', role: '45 links', icon: <Zap className="h-5 w-5" /> },
  ]

  // MagicBento features for second page
  const bentoFeatures = [
    {
      color: '#0a0118',
      title: 'QR Code Generator',
      description: 'Create stunning, customizable QR codes for print materials, business cards, and offline campaigns. Download in multiple formats with brand colors.',
      icon: <RadixIcons.ComponentInstanceIcon className="h-6 w-6 text-cyan-400" />,
      category: 'Tools',
      label: 'TOOLS'
    },
    {
      color: '#0a0118',
      title: 'Custom Branded Links',
      description: 'Transform long URLs into memorable, branded short links. Choose custom aliases that reflect your brand identity and boost click-through rates by up to 39%.',
      icon: <RadixIcons.Link2Icon className="h-6 w-6 text-pink-400" />,
      category: 'Branding',
      label: 'BRANDING',
      large: true
    },
    {
      color: '#0a0118',
      title: 'Real-Time Analytics Dashboard',
      description: 'Monitor clicks, conversions, and user behavior with live data visualization. Track performance metrics across all your shortened links with beautiful charts and insights.',
      category: 'Analytics',
      image: '/Analytics.png',
      hideIconAndLabel: true
    },
    {
      color: '#0a0118',
      title: 'Smart Link Management',
      description: 'Organize thousands of links with tags, folders, and search. Bulk edit, archive, or delete links. Set expiration dates and manage link lifecycle with powerful admin tools.',
      category: 'Management',
      large: true,
      image: '/smartLinkManagement.png',
      hideIconAndLabel: true
    },
    {
      color: '#0a0118',
      title: 'Geographic Insights',
      description: 'Discover where your audience lives with interactive maps. Target specific regions and optimize campaigns based on geographic performance data.',
      icon: <RadixIcons.GlobeIcon className="h-6 w-6 text-green-400" />,
      category: 'Insights',
      label: 'INSIGHTS'
    },
    {
      color: '#0a0118',
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SOC 2 compliance, and 99.99% uptime SLA. Your links are protected with advanced threat detection and DDoS mitigation.',
      icon: <RadixIcons.LockClosedIcon className="h-6 w-6 text-amber-400" />,
      category: 'Security',
      label: 'SECURITY'
    },
  ]

  const faqs = [
    {
      question: 'How does Shortifi work?',
      answer: 'Simply paste your long URL into Shortifi, and we instantly generate a short, memorable link. You can customize the link alias, generate QR codes, and track every click with detailed analytics—all in real-time.',
    },
    {
      question: 'Is Shortifi free to use?',
      answer: 'Yes! Shortifi offers a generous free tier with unlimited link shortening, QR code generation, and basic analytics. Premium plans unlock advanced features like custom domains and detailed geo-tracking.',
    },
    {
      question: 'Can I track my link analytics?',
      answer: 'Absolutely! Every shortened link comes with comprehensive analytics including total clicks, geographic locations, device types, browsers, referrer sources, and click-through rates over time.',
    },
    {
      question: 'Are the short links permanent?',
      answer: 'Yes, your short links are permanent and will never expire. You have full control to edit, deactivate, or delete them anytime from your dashboard.',
    },
    {
      question: 'Can I customize my short links?',
      answer: 'Yes! You can create branded short links with custom aliases that are easy to remember and share. Choose any available alias to make your links stand out.',
    },
    {
      question: 'Do you offer QR code generation?',
      answer: 'Yes! Every short link can instantly generate a QR code in multiple formats (PNG, SVG, DataURL). Perfect for print materials, presentations, and offline marketing campaigns.',
    },
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* HERO SECTION - With Prism Effect */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Prism  
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0.5}
            glow={1}
          />
        </div>
        
        <div className="container px-4 sm:px-6 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 max-w-5xl mx-auto"
          >
            <Badge variant="outline" className="mx-auto px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-2 inline" />
              Trusted by 10,000+ Users
            </Badge>

            <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-normal leading-[1.1]">
              <span className="block mb-2">Shorten Links Amplify Results</span>
              
              <span className="block mt-2 italic tracking-tight">Track Everything.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-[rgb(207,207,207)] max-w-3xl mx-auto leading-relaxed">
              Transform long, messy URLs into powerful branded short links with 
              real-time analytics, QR codes, and click tracking that drives growth.
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="text-lg px-10 py-7 rounded-full">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="text-lg px-10 py-7 rounded-full bg-purple-600 hover:bg-purple-700">
                      Get started today
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-full backdrop-blur-sm">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div> */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="pt-16"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block cursor-pointer"
              >
                <ChevronDown className="h-10 w-10 text-muted-foreground" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED SECTION 1 - MagicBento Grid */}
      <section className="relative py-16 md:py-32 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8 relative z-10 max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12 md:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl mx-auto leading-[1.15] px-4">
              Powerful features that make link management effortless
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              From URL shortening to advanced analytics—everything you need to track, measure, and grow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full"
          >
            <MagicBento items={bentoFeatures}
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255" 
            />
          </motion.div>
        </div>
      </section>

      {/* FEATURED SECTION 2 - Gather-style Dashboard */}
      <section className="relative py-32 overflow-hidden bg-background">
        <div className="container px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-20"
          >
            <Badge variant="outline" className="mb-4">Built for smart people😎</Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold max-w-4xl mx-auto leading-[1.15]">
              Everything you need to shorten, track, and optimize your links
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful link shortening with real-time analytics, custom branding, and QR code generation—all in one platform
            </p>
          </motion.div>

          {/* Dashboard Preview - Gather Style */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            <div className="relative rounded-3xl border-2 bg-background/50 backdrop-blur-xl p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column - Payments */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Traffic Sources</h3>
                  {paymentsData.map((payment, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                          {payment.icon}
                        </div>
                        <span className="font-medium">{payment.name}</span>
                      </div>
                      <span className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">{payment.amount}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Center Column - Budget Chart */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Click Performance</h3>
                    <div className="relative w-48 h-48 mx-auto">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-muted/20"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray="502"
                          strokeDashoffset="125"
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold">75%</div>
                          <div className="text-xs text-muted-foreground mt-1">CTR Growth</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-around text-center pt-4">
                      <div>
                        <div className="text-3xl font-bold">5.9K</div>
                        <div className="text-xs text-muted-foreground">Total Clicks</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">366</div>
                        <div className="text-xs text-muted-foreground">Short Links</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Team Members & Stats */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Active Teams</h3>
                    <div className="space-y-3">
                      {teamMembers.map((member, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-card border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                              {member.icon}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{member.name}</div>
                              <div className="text-xs text-muted-foreground">{member.role}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-purple-500/10 border-2 border-purple-500/20">
                    <div className="text-4xl font-bold">+285%</div>
                    <div className="text-sm text-muted-foreground mt-1">Increase in engagement with short links</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      

      {/* FAQ SECTION - Color Bends Background */}
      <section className="relative min-h-screen py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ColorBends />
        </div>
        
        <div className="container px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Shortifi
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="backdrop-blur-xl bg-background/80 border-2">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CONTACT SUPPORT SECTION - Iridescence + Contact Form */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 mb-12"
          >
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
              Get in Touch
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Need Help? We're Here
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Questions about link shortening, analytics, or features? Our team is ready to assist you
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
            {/* Left Side - Iridescence Effect */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[400px] lg:h-[480px]"
            >
              <div className="relative h-full rounded-3xl overflow-hidden border-2 border-border/50 shadow-2xl backdrop-blur-sm">
                <div className="absolute inset-0 opacity-80">
                  <Iridescence />
                </div>
              </div>
            </motion.div>

            {/* Right Side - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Card className="border-2 border-border/50 shadow-2xl backdrop-blur-sm">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription className="text-sm">
                    Fill out the form below and we'll get back to you soon
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        className="h-10 text-sm border-border/50 focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="h-10 text-sm border-border/50 focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">Your Message</Label>
                      <textarea
                        id="message"
                        className="flex min-h-[120px] w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                        placeholder="Tell us how we can help you..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-auto px-8 h-10 text-sm font-medium gap-2 bg-black/80 hover:bg-black backdrop-blur-sm border border-white/10 rounded-full transition-all duration-300 text-white"
                    >
                      Send Message
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      {/* <footer className="relative border-t border-border/50 bg-black/20 backdrop-blur-sm">
        <div className="container px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
            <div className="md:col-span-1">
              <Link to="/landing" className="inline-block mb-4">
                <div className="flex items-center gap-2">
                  <Database className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold">Shortifi</span>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Shorten links, amplify results. Track everything with powerful analytics.
              </p>
            </div>

          
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/90">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    QR Codes
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Link Management
                  </Link>
                </li>
              </ul>
            </div>

     
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/90">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="https://github.com/adityapandey78" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

          
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/90">Legal</h3>
              <ul className="space-y-3 mb-6">
                <li>
                  <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <a href="mailto:adityapandey.2402@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>

          
              <div className="flex items-center gap-3">
                <a 
                  href="https://x.com/adityapandey78" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group"
                >
                  <Twitter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                <a 
                  href="https://github.com/adityapandey78" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group"
                >
                  <Github className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/adityapandey78/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group"
                >
                  <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Shortifi. All rights reserved.
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span></span>
                <span className="text-red-500 animate-pulse"></span>
                <span></span>
                <a 
                  href="https://github.com/adityapandey78" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium hover:text-primary transition-colors"
                >
                  Aditya Pandey
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer> */}
      <Footer/>

      {/* FINAL CTA SECTION */}
      {/* <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Prism 
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0.5}
            glow={1}
          />
        </div>
        <div className="container px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.15]">
              Ready to supercharge your links?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of marketers and businesses who trust Shortifi to power their campaigns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/register">
                <Button size="lg" className="text-lg px-10 py-7 rounded-full bg-purple-600 hover:bg-purple-700">
                  Start Shortening for Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  )
}
