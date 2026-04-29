module.exports = function imgUrl(url, opts = {}) {
  if (!url || typeof url !== "string") return url || "";
  // Only transform Cloudinary URLs
  if (!url.includes("/upload/")) return url;
  const transforms = ["f_auto", "q_auto"];
  if (opts.w) transforms.push(`w_${opts.w}`);
  if (opts.h) transforms.push(`h_${opts.h}`);
  if (opts.c) transforms.push(`c_${opts.c}`); // e.g., c_fill
  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
};
