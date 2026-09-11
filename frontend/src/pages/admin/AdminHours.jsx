import React, { useEffect, useState } from "react";
import client from "../../api/client";

export default function AdminHours() {
  const [hours, setHours] = useState([]);

  const load = async () => {
    const { data } = await client.get("/store-hours/");
    setHours((data.results ?? data).sort((a, b) => a.day_of_week - b.day_of_week));
  };
  useEffect(() => { load(); }, []);

  const update = async (id, field, value) => {
    setHours((h) => h.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
    await client.patch(`/store-hours/${id}/`, { [field]: value });
  };

  return (
    <div>
      <h3 className="font-display mt-0">Store Hours</h3>
      {hours.map((d) => (
        <div key={d.id} className="flex items-center gap-3 py-2 border-b border-cream">
          <span className="w-24 text-sm">{d.day_name}</span>
          <input type="time" value={d.open_time?.slice(0, 5)} disabled={d.is_closed} onChange={(e) => update(d.id, "open_time", e.target.value)} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
          <span className="text-mute">to</span>
          <input type="time" value={d.close_time?.slice(0, 5)} disabled={d.is_closed} onChange={(e) => update(d.id, "close_time", e.target.value)} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
          <label className="text-xs text-mute ml-auto flex items-center gap-1.5">
            <input type="checkbox" checked={d.is_closed} onChange={(e) => update(d.id, "is_closed", e.target.checked)} /> Closed
          </label>
        </div>
      ))}
    </div>
  );
}
