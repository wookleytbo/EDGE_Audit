import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, FileText, Users, Database, ImageIcon, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Professional Audit Management Platform
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Streamline your audit processes with custom forms, real-time data collection, and comprehensive audit management. 
            Built for compliance, safety, and quality assurance professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/builder">Create Audit Form</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
              <Link href="/templates">View Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Comprehensive Audit Management Solutions
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">Professional tools designed for audit professionals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Custom Audit Forms</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create professional audit forms in minutes with our intuitive drag-and-drop interface. No coding required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Evidence Documentation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Capture images and evidence directly in your audit forms for comprehensive documentation and compliance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Digital Signatures</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get audit approvals and sign-offs instantly with secure digital signature capture.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Secure Cloud Storage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All audit data is automatically synced to secure cloud storage. Access from anywhere, anytime.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Real-Time Sync</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Audit data syncs instantly as forms are completed. Get immediate access to all submissions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Share audit forms with your team, assign audit tasks, and track completion status.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Built for Every Audit Need</h2>
          <p className="text-lg text-muted-foreground text-pretty">Trusted by audit professionals across multiple industries</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            "Compliance Audits",
            "Safety Audits",
            "Quality Assurance",
            "Financial Audits",
            "Environmental Audits",
            "Security Audits",
            "Process Audits",
            "Risk Assessments",
          ].map((industry) => (
            <Card key={industry}>
              <CardContent className="pt-6">
                <p className="text-lg font-medium text-card-foreground">{industry}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Ready to Streamline Your Audit Process?</h2>
          <p className="text-lg mb-8 opacity-90 text-pretty max-w-2xl mx-auto">
            Join audit professionals using EDGE Audit to improve efficiency, compliance, and data accuracy
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/builder">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold text-foreground mb-4">
                <FileText className="h-6 w-6 text-primary" />
                FieldForm
              </div>
              <p className="text-sm text-muted-foreground">Professional form builder for field teams</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/templates" className="text-muted-foreground hover:text-foreground">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/builder" className="text-muted-foreground hover:text-foreground">
                    Form Builder
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
            <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 EDGE Audit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
