const stats = [
    { id: 1, name: 'Schools Onboarded', value: '16+' },
    { id: 2, name: 'Active Users', value: '5000+' },
    { id: 3, name: 'Countries', value: '4' },
    { id: 4, name: 'Reliable Support', value: '24/7' },
  ]
  
  export default function Stats() {
    return (
      <div className="bg-[#DFE8FF] lg:mt-0 md:mt-20 sm:mt-20 mt-16 lg:py-10 md:py-14 sm:py-14 py-12 lg:mx-32 md:mx-20 sm:mx-20 mx-12 lg:-top-20 md:top-0 sm:top-0 top-0 relative rounded-2xl drop-shadow-sm">
        <div className="px-0 md:px-6 lg:px-8">
          <dl className="grid md:grid-cols-2 grid-cols-1 lg:gap-x-8 lg:gap-y-16 md:gap-y-14 sm:gap-y-12 gap-y-12 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="mx-auto flex max-w-xs flex-col lg:gap-y-4 md:gap-y-4 sm:gap-y-2 gap-y-2">
                <dt className="text-[#0045F6] lg:text-lg md:text-xl sm:text-lg text-lg">{stat.name}</dt>
                <dd className="order-first font-bold tracking-tight text-[#0045F6] lg:text-5xl md:text-5xl sm:text-5xl text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
  }