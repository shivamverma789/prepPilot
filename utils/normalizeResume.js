const mongoose = require("mongoose");

exports.normalizeResume = (data) => {

  const safe = data || {}

  // BASICS
  const basics = {
    fullName: safe.basics?.fullName || "",
    email: safe.basics?.email || "",
    phone: safe.basics?.phone || "",
    location: safe.basics?.location || "",
    links: Array.isArray(safe.basics?.links) ? safe.basics.links : []
  }

  const sections = []

  const defaultSections = [
    { title: "Summary", type: "text", order: 1 },
    { title: "Skills", type: "grouped-list", order: 2 },
    { title: "Experience", type: "entries", order: 3 },
    { title: "Projects", type: "entries", order: 4 },
    { title: "Education", type: "entries", order: 5 }
  ]

  defaultSections.forEach(def => {

    const found = (safe.sections || []).find(
      s => s.title?.toLowerCase() === def.title.toLowerCase()
    )

    let data = found?.data || (def.type === "text" ? "" : [])

    // 🔥 FIX ENTRIES
    if(def.type === "entries"){
      data = (data || []).map(entry => ({
        _id: new mongoose.Types.ObjectId(),

        title: entry.title || "",
        subtitle: entry.subtitle || "",
        location: entry.location || "",
        startDate: entry.startDate || "",
        endDate: entry.endDate || "",

        bullets: (entry.bullets || []).map(b => ({
          _id: new mongoose.Types.ObjectId(),
          text: b.text || "",
          isAIEnhanced: false,
          hasMetric: false
        }))
      }))
    }

    // 🔥 FIX GROUPED LIST
    if(def.type === "grouped-list"){
      data = (data || []).map(group => ({
        group: group.group || "",
        items: Array.isArray(group.items) ? group.items : []
      }))
    }

    // TEXT SAFE
    if(def.type === "text"){
      data = data || ""
    }

    sections.push({
      title: def.title,
      type: def.type,
      order: def.order,
      data
    })

  })

  return { basics, sections }

}