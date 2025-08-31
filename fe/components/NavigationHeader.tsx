"use client";

import React from 'react';
import { Settings, User, Clock, Grid3X3 } from 'lucide-react';

export function NavigationHeader() {
  return (
    <header className="bg-[#0F1419] border-b border-[#2A3441] px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-yellow-500 font-bold text-xl">exness</div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded">
              <img src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=20&h=20&fit=crop" alt="US" className="w-4 h-4 rounded-sm" />
              <span className="text-sm">XAU/USD</span>
            </div>
            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded">
              <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">₿</div>
              <span className="text-sm">BTC</span>
            </div>
            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded">
              <img src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=20&h=20&fit=crop" alt="EU" className="w-4 h-4 rounded-sm" />
              <span className="text-sm">EUR/USD</span>
            </div>
            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded">
              <img src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=20&h=20&fit=crop" alt="JP" className="w-4 h-4 rounded-sm" />
              <span className="text-sm">USD/JPY</span>
            </div>
            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded">
              <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">₿</div>
              <span className="text-sm">BTC</span>
            </div>
            <button className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-[#3A4854] transition-colors">
              <span className="text-lg">+</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-green-500 font-medium">12,206.40 USD</div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Demo</span>
            <span className="text-gray-400 text-sm">Standard</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <Settings className="w-5 h-5 text-gray-400" />
            <Grid3X3 className="w-5 h-5 text-gray-400" />
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
            Deposit
          </button>
        </div>
      </div>
    </header>
  );
}