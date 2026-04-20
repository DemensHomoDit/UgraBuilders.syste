import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FOUNDATION_TYPES,
  ROOF_TYPES,
  HEATING_TYPES,
  INSULATION_TYPES,
  WINDOW_TYPES,
} from "./constants";
import { ProjectSpecificationsProps } from "./types";

const ProjectSpecifications: React.FC<ProjectSpecificationsProps> = ({
  formData,
  handleNumberChange,
  handleSelectChange,
  handleCheckboxChange,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Размеры и площадь
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="areavalue">
                  Площадь (м²) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="areavalue"
                  name="areavalue"
                  type="number"
                  value={formData.areavalue ?? ""}
                  onChange={(e) =>
                    handleNumberChange(
                      "areavalue",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  min={0}
                  placeholder="120"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Размеры (м)</Label>
                <Input
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions || ""}
                  onChange={(e) =>
                    handleSelectChange("dimensions", e.target.value)
                  }
                  placeholder="10x12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricevalue">
                  Стоимость (млн ₽) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pricevalue"
                  name="pricevalue"
                  type="number"
                  value={formData.pricevalue ?? ""}
                  onChange={(e) =>
                    handleNumberChange(
                      "pricevalue",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  min={0}
                  placeholder="4.5"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Комнаты</Label>
                <Input
                  id="rooms"
                  name="rooms"
                  type="number"
                  value={(formData as any).rooms ?? ""}
                  onChange={(e) =>
                    handleNumberChange(
                      "rooms",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  min={0}
                  placeholder="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Спальни</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  value={formData.bedrooms ?? ""}
                  onChange={(e) =>
                    handleNumberChange(
                      "bedrooms",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  min={0}
                  placeholder="3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Санузлы</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  value={formData.bathrooms ?? ""}
                  onChange={(e) =>
                    handleNumberChange(
                      "bathrooms",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  min={0}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stories">Этажи</Label>
                <Input
                  id="stories"
                  name="stories"
                  type="number"
                  value={formData.stories ?? ""}
                  onChange={(e) =>
                    handleNumberChange(
                      "stories",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  min={1}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ceiling_height">Высота потолков (м)</Label>
                <Input
                  id="ceiling_height"
                  name="ceiling_height"
                  type="number"
                  value={(formData as any).ceiling_height ?? ""}
                  onChange={(e) =>
                    handleNumberChange(
                      "ceiling_height",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  min={0}
                  step="0.1"
                  placeholder="2.7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="construction_time">Срок строительства</Label>
                <Input
                  id="construction_time"
                  name="construction_time"
                  value={(formData as any).construction_time || ""}
                  onChange={(e) =>
                    handleSelectChange("construction_time", e.target.value)
                  }
                  placeholder="3-4 месяца"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Конструктивные решения
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foundation_type">Тип фундамента</Label>
                <Select
                  value={(formData as any).foundation_type || ""}
                  onValueChange={(value) =>
                    handleSelectChange("foundation_type", value)
                  }
                >
                  <SelectTrigger id="foundation_type" className="mt-1">
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOUNDATION_TYPES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roof_type">Тип крыши</Label>
                <Select
                  value={(formData as any).roof_type || ""}
                  onValueChange={(value) =>
                    handleSelectChange("roof_type", value)
                  }
                >
                  <SelectTrigger id="roof_type" className="mt-1">
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOF_TYPES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wall_thickness">Толщина стен (мм)</Label>
                <Input
                  id="wall_thickness"
                  name="wall_thickness"
                  value={(formData as any).wall_thickness || ""}
                  onChange={(e) =>
                    handleSelectChange("wall_thickness", e.target.value)
                  }
                  placeholder="200"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Инженерия и отделка
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heating">Отопление</Label>
                <Select
                  value={(formData as any).heating || ""}
                  onValueChange={(value) =>
                    handleSelectChange("heating", value)
                  }
                >
                  <SelectTrigger id="heating" className="mt-1">
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEATING_TYPES.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="insulation">Утеплитель</Label>
                <Select
                  value={(formData as any).insulation || ""}
                  onValueChange={(value) =>
                    handleSelectChange("insulation", value)
                  }
                >
                  <SelectTrigger id="insulation" className="mt-1">
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSULATION_TYPES.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="window_type">Окна</Label>
                <Select
                  value={(formData as any).window_type || ""}
                  onValueChange={(value) =>
                    handleSelectChange("window_type", value)
                  }
                >
                  <SelectTrigger id="window_type" className="mt-1">
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    {WINDOW_TYPES.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Дополнительные опции
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasgarage"
                  checked={formData.hasgarage || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("hasgarage", checked)
                  }
                />
                <Label htmlFor="hasgarage" className="cursor-pointer">
                  Гараж
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasterrace"
                  checked={formData.hasterrace || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("hasterrace", checked)
                  }
                />
                <Label htmlFor="hasterrace" className="cursor-pointer">
                  Терраса
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasbasement"
                  checked={(formData as any).hasbasement || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("hasbasement", checked)
                  }
                />
                <Label htmlFor="hasbasement" className="cursor-pointer">
                  Подвал/цоколь
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hassecondlight"
                  checked={(formData as any).hassecondlight || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("hassecondlight", checked)
                  }
                />
                <Label htmlFor="hassecondlight" className="cursor-pointer">
                  Второй свет
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="haspantry"
                  checked={(formData as any).haspantry || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("haspantry", checked)
                  }
                />
                <Label htmlFor="haspantry" className="cursor-pointer">
                  Кладовая
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasbalcony"
                  checked={(formData as any).hasbalcony || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("hasbalcony", checked)
                  }
                />
                <Label htmlFor="hasbalcony" className="cursor-pointer">
                  Балкон
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasfireplace"
                  checked={(formData as any).hasfireplace || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("hasfireplace", checked)
                  }
                />
                <Label htmlFor="hasfireplace" className="cursor-pointer">
                  Камин
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSpecifications;
