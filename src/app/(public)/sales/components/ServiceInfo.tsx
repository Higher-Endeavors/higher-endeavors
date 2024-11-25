export default function ServiceInfo() {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold mb-12 text-center">
        Detailed Service Information
      </h2>
      
      <div className="space-y-12">
        <section>
          <h3 className="text-2xl font-semibold mb-4">Ebooks</h3>
          <p className="text-gray-600 mb-4">
            Our comprehensive ebooks provide in-depth knowledge and practical strategies
            for performance enhancement. Each book is carefully crafted to deliver
            actionable insights that you can implement immediately.
          </p>
          <ul className="list-disc list-inside text-gray-600 ml-4">
            <li>Step-by-step performance improvement guides</li>
            <li>Research-backed methodologies</li>
            <li>Practical exercises and worksheets</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-4">Courses</h3>
          <p className="text-gray-600 mb-4">
            Our structured online courses combine video lessons, interactive content,
            and practical assignments to provide a comprehensive learning experience
            that fits your schedule.
          </p>
          <ul className="list-disc list-inside text-gray-600 ml-4">
            <li>Expert-led video instruction</li>
            <li>Hands-on practical exercises</li>
            <li>Community support and feedback</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-4">Website Subscription</h3>
          <p className="text-gray-600 mb-4">
            Get exclusive access to our premium content library, regular updates,
            and special member-only resources to support your ongoing development.
          </p>
          <ul className="list-disc list-inside text-gray-600 ml-4">
            <li>Regular content updates</li>
            <li>Exclusive member resources</li>
            <li>Early access to new materials</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-4">Performance Therapy</h3>
          <p className="text-gray-600 mb-4">
            Our personalized therapy sessions are tailored to your specific needs,
            helping you overcome challenges and optimize your performance through
            one-on-one guidance.
          </p>
          <ul className="list-disc list-inside text-gray-600 ml-4">
            <li>Customized treatment plans</li>
            <li>Expert guidance and support</li>
            <li>Regular progress assessments</li>
          </ul>
        </section>
      </div>
    </div>
  )
} 