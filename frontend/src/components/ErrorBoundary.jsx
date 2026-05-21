import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
          <div className="max-w-xl rounded-lg border border-rose-500/30 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-rose-300">Application error</p>
            <h1 className="mt-2 text-2xl font-bold">ProctorVision AI could not load.</h1>
            <p className="mt-3 text-slate-300">{this.state.error.message}</p>
            <button
              className="mt-5 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              Reset and open login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
