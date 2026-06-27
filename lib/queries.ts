import { createClient } from '@/lib/supabase/client'
import type { Meal, Product } from '@/lib/types'

// Map snake_case rows from Supabase to the app's camelCase types
function rowToMeal(r: Record<string, unknown>): Meal {
  return {
    id: r.id as string,
    nameEn: r.name_en as string,
    nameAr: r.name_ar as string,
    descriptionEn: r.description_en as string,
    descriptionAr: r.description_ar as string,
    imageUrl: r.image_url as string,
    calories: r.calories as number,
    protein: r.protein as number,
    carbs: r.carbs as number,
    fat: r.fat as number,
    mealType: r.meal_type as Meal['mealType'],
    tags: (r.tags as string[]) ?? [],
  }
}

function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: r.id as string,
    nameEn: r.name_en as string,
    nameAr: r.name_ar as string,
    descriptionEn: r.description_en as string,
    descriptionAr: r.description_ar as string,
    imageUrl: r.image_url as string,
    price: Number(r.price),
    category: r.category as Product['category'],
    inStock: r.in_stock as boolean,
  }
}

export async function fetchMeals(): Promise<Meal[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('meals').select('*')
    if (error || !data) return []
    return data.map(rowToMeal)
  } catch {
    return []
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('products').select('*')
    if (error || !data) return []
    return data.map(rowToProduct)
  } catch {
    return []
  }
}
