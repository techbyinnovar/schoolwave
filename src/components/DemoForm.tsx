"use client";

import React, { useState, useRef } from "react";
import Swal from "sweetalert2";

export const DemoForm = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const sendRequest = async (e: any) => {
    e.preventDefault();

    if (form.current) {
      const formData = new FormData(form.current);
      const email = formData.get("email");
      const name = formData.get("from_name");
      const phone = formData.get("phone");
      const school = formData.get("school_name");

      if (!email || !name || !phone || !school) {
        Swal.fire({
          title: "Error!",
          text: "All fields are required.",
          icon: "error",
          confirmButtonText: "Close",
          background: "white",
          iconColor: "black",
          confirmButtonColor: "black",
        });
        return;
      }

      const requestBody = `${email},${name},${phone},${school}`;

      try {
        const response = await fetch("https://eocx5j867mo2ncr.m.pipedream.net", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: requestBody,
        });

        if (response.ok) {
          Swal.fire({
            title: "Demo Request Sent!",
            text: "Thanks for booking a demo. Expect a meeting invite soon, via your email.",
            icon: "success",
            confirmButtonText: "Close",
            background: "white",
            iconColor: "#0045F6",
            confirmButtonColor: "#0045F6",
          });
          form.current.reset();
        } else {
          throw new Error("Failed to send request");
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Check your internet connection and try again.",
          icon: "error",
          confirmButtonText: "Close",
          background: "white",
          iconColor: "black",
          confirmButtonColor: "black",
        });
      }
    }
  };

  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-4 tracking-tight text-gray-900">
            Get Started
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" ref={form} onSubmit={sendRequest}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Name
              </label>
              <input
                id="name"
                name="from_name"
                type="text"
                required
                className="block w-full rounded-md border border-gray-400 py-1.5 pl-[5px] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-[#0045F6] sm:text-sm sm:leading-6 outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-md border border-gray-400 py-1.5 pl-[5px] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-[#0045F6] sm:text-sm sm:leading-6 outline-none"
              />
            </div>

            <div>
              <label htmlFor="schoolname" className="block text-sm font-medium leading-6 text-gray-900">
                Name of School
              </label>
              <input
                id="schoolname"
                name="school_name"
                type="text"
                required
                className="block w-full rounded-md border border-gray-400 py-1.5 pl-[5px] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-[#0045F6] sm:text-sm sm:leading-6 outline-none"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="block w-full rounded-md border border-gray-400 py-1.5 pl-[5px] text-gray-900 shadow-sm focus:ring-1 focus:ring-inset focus:ring-[#0045F6] sm:text-sm sm:leading-6 outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-[#0045F6] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0046f6e0] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0045F6] cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DemoForm;
