import { useState } from 'react';
import { User, ChevronDown, ChevronUp } from 'lucide-react';

const SettingsPage = () => {
  const [openSection, setOpenSection] = useState(null);
  const [resetCode, setResetCode] = useState('');

  const toggleSection = (section: any) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
              <User size={48} className="text-zinc-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">CoopScoop</h1>
            <p className="text-zinc-300 text-sm px-4">
              I'm a software development student at Mohawk College. This WebApp is my capstone project so I hope you find it useful!
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-3 py-5">
            {/* Style Section */}
            <div className="bg-white rounded-lg overflow-hidden my-5">
              <button
                onClick={() => toggleSection('style')}
                className="w-full bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-4 flex items-center justify-between transition-colors"
              >
                <span>Style</span>
                {openSection === 'style' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === 'style' && (
                <div className="p-4 bg-white">
                  <div className="space-y-3">
                    <button className="w-full py-2 px-4 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-900 transition-colors">
                      Light Mode
                    </button>
                    <button className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors">
                      Dark Mode
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Email Change Section */}
            <div className="bg-white rounded-lg overflow-hidden my-5">
              <button
                onClick={() => toggleSection('email')}
                className="w-full bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-4 flex items-center justify-between transition-colors"
              >
                <span>Email Change</span>
                {openSection === 'email' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === 'email' && (
                <div className="p-4 bg-white">
                  <input
                    type="email"
                    placeholder="New email address"
                    className="w-full px-4 py-2 border border-zinc-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-python-blue"
                  />
                  <button className="w-full bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-2 px-4 rounded transition-colors">
                    Update Email
                  </button>
                </div>
              )}
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-lg overflow-hidden my-5">
              <button
                onClick={() => toggleSection('password')}
                className="w-full bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-4 flex items-center justify-between transition-colors"
              >
                <span>Password Change</span>
                {openSection === 'password' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === 'password' && (
                <div className="p-4 bg-white space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Reset Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-python-blue"
                    />
                  </div>
                  <div className="flex gap-2 my-5">
                    <button 
                      onClick={() => setResetCode('')}
                      className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="flex-1 bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-2 px-4 rounded transition-colors">
                      Send Email
                    </button>
                    <button className="flex-1 bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-2 px-4 rounded transition-colors">
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;