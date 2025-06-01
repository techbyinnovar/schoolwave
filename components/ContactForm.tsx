import React, { useState, useRef } from 'react'
import Swal from 'sweetalert2'

export const ContactForm = () => {
  const form = useRef<HTMLFormElement>(null);

  const sendFormData = async (e: any) => {
    e.preventDefault();

    if (form.current) {
      const formData = new FormData(form.current);
      const email = formData.get('email') as string;
      const name = formData.get('from_name') as string;
      const phone = formData.get('phone') as string;
      const school = formData.get('school_name') as string;
      const message = formData.get('message') as string;

      const formattedText = `${email}**${name}**${phone}**${school}**${message}`;

      try {
        // 1. Create a lead and add to contact us stage
        let contactStageId = undefined;
        // Try to get from settings (admin-configurable)
        const settingRes = await fetch('/api/setting?key=contact_stage_id');
        const settingData = await settingRes.json();
        if (settingData.value) {
          contactStageId = settingData.value;
        } else {
          // fallback to 'contact' stage from API
          const stageRes = await fetch('/api/stage');
          const stageData = await stageRes.json();
          const contactStage = (stageData.stages || []).find((s: any) => s.name.toLowerCase() === 'contact');
          if (contactStage) contactStageId = contactStage.id;
        }
        if (contactStageId) {
          await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schoolName: school,
              name,
              phone,
              email,
              address: '',
              numStudents: '',
              stageId: contactStageId,
              message,
            }),
          });
        }
        // 2. Continue with the original notification logic
        const response = await fetch('https://eohdyklrgkb4n0w.m.pipedream.net', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: formattedText,
        });

        if (response.ok) {
          Swal.fire({
            title: 'Message Sent!',
            text: 'Thanks for reaching out. We\'ll get back to you soon.',
            icon: 'success',
            confirmButtonText: 'Close',
            background: 'white',
            iconColor: 'olive',
            confirmButtonColor: 'olive',
          });
          form.current.reset();
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Check your internet connection and try again.',
          icon: 'error',
          confirmButtonText: 'Close',
          background: 'white',
          iconColor: '#b10d05',
          confirmButtonColor: '#b10d05',
        });
      }
    }
  };

  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-4 tracking-tight text-gray-900">
            Contact Us
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6 w-full" ref={form} onSubmit={sendFormData}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Name
              </label>
              <input
                id="name"
                name="from_name"
                type="text"
                required
                className="block w-full rounded-md border border-gray-400 py-3 px-4 text-gray-900 shadow-sm focus:ring-2 focus:ring-[#0045F6] focus:border-[#0045F6] transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-md border border-gray-400 py-3 px-4 text-gray-900 shadow-sm focus:ring-2 focus:ring-[#0045F6] focus:border-[#0045F6] transition"
              />
            </div>

            <div>
              <label htmlFor="schoolname" className="block text-sm font-medium text-gray-900">
                Name of School
              </label>
              <input
                id="schoolname"
                name="school_name"
                type="text"
                required
                className="block w-full rounded-md border border-gray-400 py-3 px-4 text-gray-900 shadow-sm focus:ring-2 focus:ring-[#0045F6] focus:border-[#0045F6] transition"
              />
            </div>

            <div className='w-full'>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="block w-full rounded-md border border-gray-400 py-3 px-4 text-gray-900 shadow-sm focus:ring-2 focus:ring-[#0045F6] focus:border-[#0045F6] transition"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                required
                className="block w-full rounded-md border border-gray-400 py-3 px-4 text-gray-900 shadow-sm focus:ring-2 focus:ring-[#0045F6] focus:border-[#0045F6] transition"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-[#0045F6] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0046f6e0]"
              >
                Contact Us
              </button>
            </div>
          </form>
          
          {/* Contact information for mobile */}
          <div className="mt-8 block md:hidden">
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Contact Us Directly:</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Email:</span> hello@schoolwave.ng
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> +234 802 133 7988
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
