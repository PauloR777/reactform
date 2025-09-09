// Todolist.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 1) Zod schema
const TaskSchema = z.object({
  title1: z.string().refine(
    val => val === "นาย" || val === "นาง",
    { message: "กรุณาเลือกคำนำหน้า" }
  ),
  title: z.string().trim().min(1, "กรุณากรอกชื่อ"),
  title2: z.string().trim().min(1, "กรุณากรอกนามสกุล"),
  title3: z.string().trim().min(1, "กรุณากรอกประวัติการทำงาน"),
  title4: z.string().trim().min(1, "กรุณากรอกผลงานที่ผ่านมา"),
  photo: z
    .instanceof(FileList)
    .optional()
    .refine(file => !file || file.length <= 1, { message: "กรุณาอัปโหลดรูปถ่าย" }),
  type: z.enum([
    "นายกรัฐมนตรี",
    "รองนายกรัฐมนตรี",
    "รัฐมนตรีว่าการกระทรวง",
    "รัฐมนตรีประจำสำนักนายกรัฐมนตรี",
    "รัฐมนตรีช่วยว่าการกระทรวง"
  ]),
  type2: z.enum([
    "พรรคเพื่อไทย",
    "พรรคภูมิใจไทย",
    "พรรคพลังประชารัฐ",
    "พรรครวมไทยสร้างชาติ",
    "พรรคประชาธิปัตย์",
    "พรรคชาติไทยพัฒนา",
    "พรรคชาติพัฒนา",
    "พรรคประชาชาติ",
    "พรรคเศรษฐกิจใหม่",
    "พรรคพลังสังคม",
    "พรรคไทรวมพลัง"
  ])
});

type Task = z.infer<typeof TaskSchema> & { photoURL?: string };

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Task>({
    resolver: zodResolver(TaskSchema),
    defaultValues: { 
      title1: "", title: "", title2: "", title3: "", title4: "", type: undefined, type2: undefined 
    },
    mode: "onSubmit",
  });

  // watch photo input เพื่อทำ preview
  const photoFile = watch("photo");

  useEffect(() => {
    if (photoFile && photoFile.length > 0) {
      const file = photoFile[0];
      setPreview(URL.createObjectURL(file));
    }
  }, [photoFile]);

  const onAdd = (data: Task) => {
    const photoFiles = data.photo;
    let photoURL: string | undefined;

    if (photoFiles && photoFiles.length > 0) {
      photoURL = URL.createObjectURL(photoFiles[0]);
    } else if (editIndex !== null) {
      photoURL = tasks[editIndex].photoURL; // ถ้าแก้ไข ใช้ของเดิม
    } else {
      photoURL = undefined; // เพิ่มใหม่แต่ไม่เลือกไฟล์
    }

    const newTask = { ...data, photoURL };

    if (editIndex !== null) {
      setTasks(prev => prev.map((t, i) => i === editIndex ? newTask : t));
      setEditIndex(null);
    } else {
      setTasks(prev => [...prev, newTask]);
    }

    reset();
    setPreview(null);
  };

  const onDelete = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const onEdit = (index: number) => {
    const task = tasks[index];
    reset(task); // load ข้อมูลเดิมไปฟอร์ม
    setPreview(task.photoURL || null);
    setEditIndex(index);
  };

  return (
    <div>
      <h1>ทำเนียบรายชื่อสมาชิกผู้แทนราษฎร</h1>

      <form onSubmit={handleSubmit(onAdd)} noValidate>

        <div>
          <select {...register("title1")}>
            <option value="">เลือกคำนำหน้า</option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
          </select>
          {errors.title1 && <div>{errors.title1.message}</div>}
        </div>

        <div>
          <input placeholder="ชื่อ" {...register("title")} />
          {errors.title && <div>{errors.title.message}</div>}
        </div>

        <div>
          <input placeholder="นามสกุล" {...register("title2")} />
          {errors.title2 && <div>{errors.title2.message}</div>}
        </div>

        <div>
          <input placeholder="ประวัติการทำงาน" {...register("title3")} />
          {errors.title3 && <div>{errors.title3.message}</div>}
        </div>

        <div>
          <input placeholder="ผลงานที่ผ่านมา" {...register("title4")} />
          {errors.title4 && <div>{errors.title4.message}</div>}
        </div>

        <div>
          <input type="file" {...register("photo")} accept="image/*" />
          {errors.photo && <div>{errors.photo.message}</div>}
          {preview && <img src={preview} alt="preview" style={{ width: 100, marginTop: 5 }} />}
        </div>

        <div>
          <select {...register("type")}>
            <option value="">เลือกตำแหน่ง</option>
            <option value="นายกรัฐมนตรี">นายกรัฐมนตรี</option>
            <option value="รองนายกรัฐมนตรี">รองนายกรัฐมนตรี</option>
            <option value="รัฐมนตรีว่าการกระทรวง">รัฐมนตรีว่าการกระทรวง</option>
            <option value="รัฐมนตรีประจำสำนักนายกรัฐมนตรี">รัฐมนตรีประจำสำนักนายกรัฐมนตรี</option>
            <option value="รัฐมนตรีช่วยว่าการกระทรวง">รัฐมนตรีช่วยว่าการกระทรวง</option>
          </select>
          {errors.type && <div>{errors.type.message}</div>}
        </div>

        <div>
          <select {...register("type2")}>
            <option value="">เลือกพรรค</option>
            <option value="พรรคเพื่อไทย">พรรคเพื่อไทย</option>
            <option value="พรรคภูมิใจไทย">พรรคภูมิใจไทย</option>
            <option value="พรรคพลังประชารัฐ">พรรคพลังประชารัฐ</option>
            <option value="พรรครวมไทยสร้างชาติ">พรรครวมไทยสร้างชาติ</option>
            <option value="พรรคประชาธิปัตย์">พรรคประชาธิปัตย์</option>
            <option value="พรรคชาติไทยพัฒนา">พรรคชาติไทยพัฒนา</option>
            <option value="พรรคชาติพัฒนา">พรรคชาติพัฒนา</option>
            <option value="พรรคประชาชาติ">พรรคประชาชาติ</option>
            <option value="พรรคเศรษฐกิจใหม่">พรรคเศรษฐกิจใหม่</option>
            <option value="พรรคพลังสังคม">พรรคพลังสังคม</option>
            <option value="พรรคไทรวมพลัง">พรรคไทรวมพลัง</option>
          </select>
          {errors.type2 && <div>{errors.type2.message}</div>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {editIndex !== null ? "บันทึกการแก้ไข" : "Add"}
        </button>
      </form>

      <ul>
        {tasks.map((t, idx) => (
          <li key={idx} style={{ marginBottom: 10 }}>
            {t.title1} {t.title} {t.title2} | ประวัติ: {t.title3} | ผลงาน: {t.title4} | ตำแหน่ง: {t.type} | พรรค: {t.type2}
            {t.photoURL && <div><img src={t.photoURL} alt="task" style={{ width: 100, marginTop: 5 }} /></div>}
            <button onClick={() => onEdit(idx)} style={{ marginLeft: 10, color: "blue" }}>แก้ไข</button>
            <button onClick={() => onDelete(idx)} style={{ marginLeft: 10, color: "red" }}>ลบ</button>
          </li>
        ))}
      </ul>
    </div>
  );
}