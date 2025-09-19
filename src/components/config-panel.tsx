"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PlusCircle, Star, Trash2, Users, RotateCcw } from "lucide-react";
import { useEffect } from "react";

const formSchema = z
  .object({
    numCourts: z.coerce.number().min(1, "At least 1 court is required."),
    numGames: z.coerce.number().min(1, "At least 1 game is required."),
    players: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Player name is required."),
          skillLevel: z.number().min(1).max(5),
        })
      )
      .min(4, "At least 4 players are needed for doubles."),
  })
  .refine(
    (data) => {
      const names = data.players.map((p) => p.name.toLowerCase());
      return new Set(names).size === names.length;
    },
    {
      message: "Player names must be unique.",
      path: ["players"],
    }
  );

type ConfigFormValues = z.infer<typeof formSchema>;

interface ConfigPanelProps {
  onSubmit: (values: ConfigFormValues) => void;
  initialValues: ConfigFormValues | null;
  onReset: () => void;
}

const defaultValues: ConfigFormValues = {
  numCourts: 2,
  numGames: 3,
  players: [
    { name: "Alice", skillLevel: 3 },
    { name: "Bob", skillLevel: 4 },
    { name: "Charlie", skillLevel: 2 },
    { name: "Diana", skillLevel: 5 },
  ],
};

export function ConfigPanel({ onSubmit, initialValues, onReset }: ConfigPanelProps) {
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? defaultValues,
  });
  
  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "players",
  });

  return (
    <Card className="max-w-4xl mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <Users className="text-primary" />
          Game Setup
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2" />
          Reset All
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="numCourts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Courts</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numGames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Games per Court</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Players</FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 md:gap-4 p-3 bg-secondary/50 rounded-lg"
                  >
                    <FormField
                      control={form.control}
                      name={`players.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder={`Player ${index + 1} Name`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`players.${index}.skillLevel`}
                      render={({ field }) => (
                        <FormItem className="w-48 flex items-center gap-2 pt-2">
                          <FormControl>
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                           <div className="flex items-center font-bold text-sm w-8">
                              {field.value}
                              <Star className="w-4 h-4 text-accent fill-accent" />
                           </div>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                 <FormMessage>{form.formState.errors.players?.message}</FormMessage>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ name: "", skillLevel: 3 })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Player
              </Button>
            </div>

            <Button type="submit" size="lg" className="w-full">
              {initialValues ? 'Update & View Schedule' : 'Create Schedule'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
