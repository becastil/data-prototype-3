'use client';

import Link from 'next/link';
import {
  CloudUpload,
  Settings,
  BarChart,
  TrendingUp,
  Shield,
  CheckCircle,
  Zap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-uber-gray-50">
      {/* Hero Section */}
      <div className="bg-uber-black text-uber-white">
        <div className="uber-container py-20">
          <div className="max-w-3xl">
            <div className="uber-badge uber-badge-blue mb-6">
              Healthcare Analytics Platform
            </div>
            <h1 className="uber-heading-1 mb-6">
              C&E Reporting Platform
            </h1>
            <p className="text-2xl text-uber-gray-300 mb-8 leading-relaxed">
              Automated claims and expenses reporting with real-time analytics,
              interactive dashboards, and professional PDF exports.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/dashboard/upload" className="uber-btn uber-btn-blue uber-btn-lg">
                Get Started
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/dashboard/executive" className="uber-btn uber-btn-secondary uber-btn-lg">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-uber-white border-b border-uber-gray-200">
        <div className="uber-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-uber-black mb-2">4</div>
              <div className="text-sm text-uber-gray-600">Simple Steps</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-uber-black mb-2">80%</div>
              <div className="text-sm text-uber-gray-600">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-uber-black mb-2">100%</div>
              <div className="text-sm text-uber-gray-600">Automated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-uber-black mb-2">24/7</div>
              <div className="text-sm text-uber-gray-600">Real-time Analytics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="uber-container py-16">
        <div className="text-center mb-12">
          <h2 className="uber-heading-2 mb-4">Everything you need</h2>
          <p className="text-xl text-uber-gray-600">
            Comprehensive tools for healthcare claims and expenses reporting
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Upload Data Card */}
          <Link href="/dashboard/upload" className="group">
            <div className="uber-card h-full hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 bg-uber-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CloudUpload className="w-6 h-6 text-uber-white" />
              </div>
              <h3 className="uber-heading-4 mb-3">Upload Data</h3>
              <p className="text-uber-gray-600 mb-4 leading-relaxed">
                Import CSV files with built-in validation and error checking. Supports multiple file uploads.
              </p>
              <div className="flex items-center text-uber-blue font-medium">
                Get Started
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Configure Fees Card */}
          <Link href="/dashboard/fees" className="group">
            <div className="uber-card h-full hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 bg-uber-green rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-uber-white" />
              </div>
              <h3 className="uber-heading-4 mb-3">Configure Fees</h3>
              <p className="text-uber-gray-600 mb-4 leading-relaxed">
                Set up fee structures, stop loss limits, and administrative costs with flexible rate options.
              </p>
              <div className="flex items-center text-uber-blue font-medium">
                Set Up Fees
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Summary Table Card */}
          <Link href="/dashboard/summary" className="group">
            <div className="uber-card h-full hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 bg-uber-yellow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart className="w-6 h-6 text-uber-white" />
              </div>
              <h3 className="uber-heading-4 mb-3">Summary Table</h3>
              <p className="text-uber-gray-600 mb-4 leading-relaxed">
                Complete 28-row summary with automated calculations, budget tracking, and variance analysis.
              </p>
              <div className="flex items-center text-uber-blue font-medium">
                View Summary
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Analytics Card */}
          <Link href="/dashboard/analytics" className="group">
            <div className="uber-card h-full hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 bg-uber-red rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-uber-white" />
              </div>
              <h3 className="uber-heading-4 mb-3">Analytics</h3>
              <p className="text-uber-gray-600 mb-4 leading-relaxed">
                Interactive dashboards with charts, KPIs, and insights. Export professional PDF reports.
              </p>
              <div className="flex items-center text-uber-blue font-medium">
                Explore Analytics
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Navigation */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/executive" className="group">
            <div className="uber-card bg-uber-blue text-uber-white hover:bg-uber-blue-dark transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Executive Dashboard</h3>
                  <p className="text-uber-blue-light">
                    KPIs, fuel gauge, budget performance tracking
                  </p>
                </div>
                <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/hcc" className="group">
            <div className="uber-card bg-uber-black text-uber-white hover:bg-uber-gray-800 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">High Cost Claimants</h3>
                  <p className="text-uber-gray-400">
                    Track claims exceeding $100k with stop loss analysis
                  </p>
                </div>
                <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="bg-uber-white border-t border-uber-gray-200 py-16">
        <div className="uber-container">
          <div className="text-center mb-12">
            <h2 className="uber-heading-2 mb-4">Why choose our platform?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-uber-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-uber-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast & Automated</h3>
              <p className="text-uber-gray-600">
                Automated calculations save hours of manual work. Real-time updates as data changes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-uber-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-uber-blue" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Compliant</h3>
              <p className="text-uber-gray-600">
                HIPAA-conscious design with PHI protection. Audit-ready logging and access controls.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-uber-yellow-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-uber-yellow-dark" />
              </div>
              <h3 className="text-xl font-bold mb-3">Accurate & Reliable</h3>
              <p className="text-uber-gray-600">
                Built-in validation ensures data accuracy. Tested formulas matching industry standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-uber-black text-uber-white py-16">
        <div className="uber-container text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-uber-gray-300 mb-8 max-w-2xl mx-auto">
            Upload your data and start generating professional reports in minutes
          </p>
          <Link href="/dashboard/upload" className="uber-btn uber-btn-blue uber-btn-lg">
            Start Now
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-uber-gray-900 text-uber-gray-400 py-12">
        <div className="uber-container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-uber-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard/upload" className="uber-text-link">Upload Data</Link></li>
                <li><Link href="/dashboard/fees" className="uber-text-link">Configure Fees</Link></li>
                <li><Link href="/dashboard/summary" className="uber-text-link">Summary Table</Link></li>
                <li><Link href="/dashboard/analytics" className="uber-text-link">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-uber-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard/executive" className="uber-text-link">Executive Dashboard</Link></li>
                <li><Link href="/dashboard/hcc" className="uber-text-link">HCC Analysis</Link></li>
                <li><Link href="/dashboard/monthly/all" className="uber-text-link">Monthly Details</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-uber-white font-bold mb-4">About</h4>
              <p className="text-sm leading-relaxed">
                C&E Reporting Platform provides automated healthcare claims and expenses reporting
                with professional analytics and compliance-ready outputs.
              </p>
            </div>
          </div>
          <div className="border-t border-uber-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 C&E Reporting Platform. All rights reserved.</p>
            <div className="mt-4 space-x-4">
              <span className="uber-badge uber-badge-green">HIPAA Compliant</span>
              <span className="uber-badge uber-badge-blue">Real-time Analytics</span>
              <span className="uber-badge uber-badge-gray">Automated Workflows</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
