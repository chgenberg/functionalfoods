"use client";
import Link from "next/link";
import {
  FiUsers, FiBookOpen, FiDollarSign, FiFileText, FiPlusCircle, FiTrendingUp, FiActivity
} from "react-icons/fi";

export default function AdminDashboard() {
  const admin = {
    name: "Admin Ulrika",
  };

  const stats = [
    {
      title: "TOTALA ANVÄNDARE",
      value: "1,257",
      icon: FiUsers,
      change: "+12%",
      changeType: "increase",
      color: "bg-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "MÅNADSINTÄKTER",
      value: "89,450 kr",
      icon: FiDollarSign,
      change: "+5.4%",
      changeType: "increase",
      color: "bg-success",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "AKTIVA KURSER",
      value: "12",
      icon: FiBookOpen,
      change: "+2",
      changeType: "increase",
      color: "bg-secondary",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      title: "NYA BLOGGINLÄGG",
      value: "8",
      icon: FiFileText,
      change: "-1",
      changeType: "decrease",
      color: "bg-accent",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
  ];

  const quickActions = [
    { icon: FiPlusCircle, label: "Nytt blogginlägg", href: "/admin/blog/new" },
    { icon: FiPlusCircle, label: "Ny kurs", href: "/admin/courses/new" },
    { icon: FiUsers, label: "Hantera användare", href: "/admin/users" },
  ];
  
  const recentActivity = [
    { icon: FiUsers, text: "Ny användare: Karl Svensson", time: "5 min sedan", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { icon: FiDollarSign, text: "Ny order: #FF2024-0621", time: "34 min sedan", iconBg: "bg-success/10", iconColor: "text-success" },
    { icon: FiBookOpen, text: "Nytt kurskapitel publicerat: Vecka 2 - Functional Flow", time: "2 timmar sedan", iconBg: "bg-secondary/10", iconColor: "text-secondary" }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 mb-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 uppercase tracking-wider">
            VÄLKOMMEN, ADMIN!
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            Här hanterar du allt för Functional Foods.
          </p>
          <div className="flex flex-wrap gap-4">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-5 py-2.5 rounded-full transition-all transform hover:scale-105 font-medium uppercase text-sm tracking-wider"
              >
                <action.icon className="w-5 h-5" />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="flex items-center gap-1">
                {stat.changeType === 'increase' ? (
                  <FiTrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <FiActivity className="w-4 h-4 text-error" />
                )}
                <span className={`text-sm font-bold ${stat.changeType === 'increase' ? 'text-success' : 'text-error'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <h3 className="text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">{stat.title}</h3>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-text-secondary mt-1">sedan förra månaden</p>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-6">
          <h3 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider">SENASTE AKTIVITET</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-background transition-colors">
                <div className={`p-3 rounded-xl ${activity.iconBg}`}>
                  <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                </div>
                <div className="flex-grow">
                  <p className="text-primary font-medium">
                    {activity.text.split(':')[0]}:
                  </p>
                  <p className="text-text-secondary font-semibold">
                    {activity.text.split(':')[1]}
                  </p>
                </div>
                <p className="text-xs text-text-secondary uppercase tracking-wider">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-6">
          <h3 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider">SNABBLÄNKAR</h3>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <Link 
                key={i} 
                href={action.href} 
                className="flex items-center justify-between p-4 bg-background hover:bg-primary hover:text-white rounded-xl transition-all duration-200 group"
              >
                <span className="font-medium text-primary group-hover:text-white uppercase text-sm tracking-wider">{action.label}</span>
                <FiPlusCircle className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
