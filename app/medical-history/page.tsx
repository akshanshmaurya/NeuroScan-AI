"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function MedicalHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8">Medical History Form</h1>
      
      <form className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" placeholder="Enter your age" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" placeholder="Enter your gender" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" placeholder="Enter your height" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="Enter your weight" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Medical Conditions</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="diabetes" />
              <Label htmlFor="diabetes">Diabetes</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="hypertension" />
              <Label htmlFor="hypertension">Hypertension</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="heart-disease" />
              <Label htmlFor="heart-disease">Heart Disease</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="neurological" />
              <Label htmlFor="neurological">Neurological Conditions</Label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Symptoms</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Describe your current symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="Please describe any symptoms you are currently experiencing"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration of Symptoms</Label>
              <Input id="duration" placeholder="How long have you had these symptoms?" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Medications</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-medications">Current Medications</Label>
              <Textarea
                id="current-medications"
                placeholder="List any medications you are currently taking"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                placeholder="List any known allergies"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        <Button type="submit" className="w-full">Submit Medical History</Button>
      </form>
    </div>
  );
}