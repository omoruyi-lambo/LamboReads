"use client";

export function HeroBookViewer() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <iframe
        title="Animated Book Background"
        src="https://sketchfab.com/models/097f8683aa5d4c9da1530d6119c20ac3/embed?autostart=1&preload=1&ui_hint=0&ui_controls=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_watermark_link=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&camera=0&transparent=0&dnt=1"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        loading="eager"
        className="absolute inset-0 w-full h-full border-0 scale-110"
        style={{ pointerEvents: "none" }}
      />
      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-[#0B1220]/60" />
    </div>
  );
}
