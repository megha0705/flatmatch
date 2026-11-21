import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';
import { Sparkles, CheckCircle2, ShieldCheck, HeartHandshake, Compass } from 'lucide-react';

export default function HowItWorksSection({ onStartQuiz }) {
  const icons = [Compass, ShieldCheck, HeartHandshake];

  return (
    <section id="how-it-works-section" className="py-20 bg-white border-y border-[#ECE4DB]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FDF1EC] text-[#DE5737] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Simple & Human
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#211B17] tracking-tight">
            How roomie helps you find home
          </h2>
          <p className="mt-4 text-base text-stone-600">
            Finding a flatmate shouldn't be an awkward gamble on social media forums. We match you by routines, values, and shared respect.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS_STEPS.map((step, idx) => {
            const Icon = icons[idx];
            return (
              <div 
                key={step.step}
                className="relative bg-[#FAF7F2] rounded-3xl p-8 border border-[#ECE4DB] hover:border-[#DE5737]/40 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-[#DE5737]/30 group-hover:text-[#DE5737] transition-colors">
                      {step.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-stone-200/60 flex items-center justify-center text-[#DE5737]">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-white text-stone-700 border border-stone-200 mb-3">
                    {step.badge}
                  </span>

                  <h3 className="text-xl font-bold text-[#211B17] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-stone-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#ECE4DB]/70 flex items-center gap-2 text-xs font-semibold text-[#DE5737]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Roomie Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner CTA */}
        <div className="mt-14 bg-[#FAF7F2] rounded-3xl p-8 sm:p-10 border border-[#ECE4DB] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-[#211B17]">
              Ready to meet flatmates who actually match your rhythm?
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              Join thousands of happy flatmates in Bangalore, Mumbai, Delhi, Pune, and Hyderabad.
            </p>
          </div>
          <button
            onClick={onStartQuiz}
            className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-semibold px-7 py-3.5 rounded-full text-sm sm:text-base whitespace-nowrap shadow-sm hover:shadow transition-all"
          >
            Take 2-Min Vibe Quiz →
          </button>
        </div>

      </div>
    </section>
  );
}
