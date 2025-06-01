"use client";
import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex bg-gray-100 text-black">
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-3xl bg-white rounded shadow p-8">
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Schoolwave Terms of Service</h1>
          <p className="mb-4">Welcome to Schoolwave, an educational management platform developed and owned by Innovar Ideas Ltd. Please read these Terms of Service (&quot;Terms&quot;) carefully before using Schoolwave. By accessing or using Schoolwave, you agree to be bound by these Terms.</p>

          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Acceptance of Terms</strong>
              <p>By consenting to and creating an account, accessing, or using Schoolwave, you confirm that you have read, understood, and agree to these Terms. If you do not agree, please do not use the platform.</p>
            </li>
            <li>
              <strong>Definitions</strong>
              <ul className="list-disc pl-6">
                <li><b>&quot;Schoolwave Platform&quot;</b>: The software application and its features, including student management, grading, communication, and related services.</li>
                <li><b>&quot;Authorized Users&quot;</b>: Individuals (staff, teachers, and students) granted access to the platform by the school.</li>
                <li><b>&quot;Subscription Fee&quot;</b>: The fee paid by the school for access to the platform.</li>
              </ul>
            </li>
            <li>
              <strong>Scope of Service</strong>
              <ul className="list-disc pl-6">
                <li>Student record management</li>
                <li>Attendance tracking</li>
                <li>Grading and assessment</li>
                <li>Communication with parents/guardians</li>
                <li>Any other features added over time.</li>
              </ul>
            </li>
            <li>
              <strong>User Accounts</strong>
              <ul className="list-disc pl-6">
                <li>Schools are responsible for providing accurate information during registration.</li>
                <li>Authorized Users must maintain the confidentiality of their login credentials.</li>
              </ul>
            </li>
            <li>
              <strong>Subscription Plans and Payment</strong>
              <ul className="list-disc pl-6">
                <li>Access to Schoolwave is based on a subscription fee, payable in advance.</li>
                <li>Fees may be updated at the end of each subscription period with 30 days&apos; notice.</li>
                <li>Late payments may result in temporary suspension of access.</li>
              </ul>
            </li>
            <li>
              <strong>Data Protection and Privacy Policy</strong>
              <ul className="list-disc pl-6">
                <li>Schoolwave is committed to protecting user data.</li>
                <li>Data uploaded by schools is stored securely and will not be shared without authorization.</li>
                <li>Personal information collected will only be used for providing the Schoolwave service and support.</li>
                <li>Schoolwave implements industry-standard security measures to protect user data.</li>
              </ul>
            </li>
            <li>
              <strong>Anti-Money Laundering (AML) Compliance</strong>
              <ul className="list-disc pl-6">
                <li>Schoolwave is committed to complying with all applicable Anti-Money Laundering (AML) regulations.</li>
                <li>Schools must ensure that their payments are sourced from legitimate, legal activities.</li>
                <li>Suspicious activities, including fraudulent payments, will be reported to relevant authorities.</li>
                <li>Schoolwave reserves the right to request additional verification documents if necessary.</li>
              </ul>
            </li>
            <li>
              <strong>User Responsibilities</strong>
              <ul className="list-disc pl-6">
                <li>Schools must provide accurate data for setup and management.</li>
                <li>Unauthorized sharing or misuse of Schoolwave may result in suspension.</li>
              </ul>
            </li>
            <li>
              <strong>Support and Training</strong>
              <ul className="list-disc pl-6">
                <li>Initial training is provided during onboarding.</li>
                <li>Ongoing support is available via email, phone, or chat.</li>
              </ul>
            </li>
            <li>
              <strong>Termination</strong>
              <ul className="list-disc pl-6">
                <li>Either party may choose not to renew access at the end of any subscription term.</li>
                <li>Schoolwave may terminate access if:</li>
                <ul className="list-[circle] pl-8">
                  <li>The school violates the Terms of Service.</li>
                  <li>Schoolwave decides to discontinue the platform in the future. In such a case, affected schools will be notified at least 30 days in advance, with support provided for data export.</li>
                </ul>
              </ul>
            </li>
            <li>
              <strong>Intellectual Property</strong>
              <p>Schoolwave retains ownership of all software, designs, and branding.</p>
            </li>
            <li>
              <strong>Limitation of Liability</strong>
              <p>Schoolwave is not liable for indirect, incidental, or consequential damages.</p>
            </li>
            <li>
              <strong>Amendments</strong>
              <p>Schoolwave reserves the right to update these Terms with 30 days&apos; notice.</p>
            </li>
            <li>
              <strong>Governing Law</strong>
              <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
              <p>In the event of any dispute arising out of or relating to these Terms, the parties shall first attempt to resolve the dispute amicably through good-faith negotiations.</p>
              <p>If the dispute is not resolved within 30 days of written notification, it shall be referred to mediation.</p>
              <p>If mediation fails, the dispute shall be finally resolved by arbitration in Lagos, Nigeria, in accordance with the Arbitration and Conciliation Act, Cap A18, Laws of the Federation of Nigeria 2004. The decision of the arbitrator shall be final and binding on the parties.</p>
            </li>
            <li>
              <strong>Contact Information</strong>
              <p>For any questions or concerns, please contact Schoolwave at <a href="mailto:mail@schoolwave.ng" className="text-blue-600 underline">mail@schoolwave.ng</a> or call <a href="tel:+2348021337988" className="text-blue-600 underline">+234 802 133 7988</a></p>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}

