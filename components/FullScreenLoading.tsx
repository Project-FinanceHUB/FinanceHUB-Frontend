'use client'

/**
 * Loading em tela inteira com animação Pulse e fundo branco semitransparente.
 */
export default function FullScreenLoading() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Carregando"
    >
      <div className="flex flex-col items-center gap-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          width={120}
          height={120}
          className="block"
          style={{ shapeRendering: 'auto' }}
          aria-hidden
        >
          <g>
            <rect fill="var(--primary, #008374)" height="40" width="15" y="30" x="17.5">
              <animate begin="-0.2s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="18;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="y" />
              <animate begin="-0.2s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="64;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="height" />
            </rect>
            <rect fill="var(--accent, #89ba16)" height="40" width="15" y="30" x="42.5">
              <animate begin="-0.1s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="20.999999999999996;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="y" />
              <animate begin="-0.1s" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="58.00000000000001;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="height" />
            </rect>
            <rect fill="#039a42" height="40" width="15" y="30" x="67.5">
              <animate keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="20.999999999999996;30;30" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="y" />
              <animate keySplines="0 0.5 0.5 1;0 0.5 0.5 1" values="58.00000000000001;40;40" keyTimes="0;0.5;1" calcMode="spline" dur="1s" repeatCount="indefinite" attributeName="height" />
            </rect>
          </g>
        </svg>
        <p className="text-sm font-medium text-slate-600">Carregando...</p>
      </div>
    </div>
  )
}
