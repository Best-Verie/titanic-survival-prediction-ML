
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  age: z.number().min(0).max(100, { message: "Age must be between 0 and 100" }),
  sex: z.enum(["male", "female"]),
  passengerClass: z.enum(["1", "2", "3"]),
  siblings: z.number().min(0).max(10),
  parents: z.number().min(0).max(10),
});

export const TitanicPredictionForm: React.FC = () => {
  const [prediction, setPrediction] = useState<{ text: string; probability: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 30,
      sex: "male",
      passengerClass: "2",
      siblings: 0,
      parents: 0,
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('titanic-predict', {
        body: values
      });

      if (error) {
        throw error;
      }

      if (!data || !data.prediction) {
        throw new Error('Invalid response from prediction service');
      }

      setPrediction({
        text: data.prediction,
        probability: Math.round(data.probability * 100)
      });
    } catch (error) {
      console.error('Prediction failed:', error);
      setPrediction({
        text: 'Prediction failed',
        probability: 0
      });
      
      toast({
        title: "Prediction Error",
        description: "Unable to get prediction results. Please try again later.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-6 bg-soft-purple rounded-lg">
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Age" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex</FormLabel>
              <FormControl>
                <select 
                  {...field} 
                  className="w-full p-2 border rounded"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passengerClass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passenger Class</FormLabel>
              <FormControl>
                <select 
                  {...field} 
                  className="w-full p-2 border rounded"
                >
                  <option value="1">First Class</option>
                  <option value="2">Second Class</option>
                  <option value="3">Third Class</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="siblings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Siblings/Spouses</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Siblings/Spouses" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Parents/Children</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Parents/Children" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Predicting...' : 'Predict Survival'}
        </Button>

        {prediction && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h3 className="text-xl font-bold text-center mb-2">{prediction.text}</h3>
            <p className="text-center text-gray-600">
              Confidence: {prediction.probability}%
            </p>
          </div>
        )}
      </form>
    </Form>
  );
};
