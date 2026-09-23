package com.example.model

data class DietPlan(
    val title: String,
    val targetGoal: String,
    val calories: Int,
    val proteinGrams: Int,
    val proteinPct: Int,
    val carbsGrams: Int,
    val carbsPct: Int,
    val fatsGrams: Int,
    val fatsPct: Int,
    val preWorkout: String,
    val postWorkout: String
)

data class FormTelemetry(
    val exercise: String,
    val confidencePct: Int,
    val primaryRisk: String,
    val kinematicsCue: String,
    val recommendedFix: String
)

data class RmPrediction(
    val exercise: String,
    val inputWeightKg: Double,
    val inputReps: Int,
    val predictedRmKg: Double,
    val confidencePct: Int,
    val targetOverload: String
)

data class ChatMessage(
    val id: String,
    val sender: String, // "user" or "ai"
    val text: String,
    val timestamp: String,
    val dietPlan: DietPlan? = null,
    val formTelemetry: FormTelemetry? = null,
    val rmPrediction: RmPrediction? = null,
    val isApplied: Boolean = false,
    val isSaved: Boolean = false
)

data class DailyActivity(
    val caloriesBurned: Int = 1840,
    val caloriesTarget: Int = 2350,
    val waterLiters: Double = 2.8,
    val waterTargetLiters: Double = 3.8,
    val streakDays: Int = 14,
    val activeMinutes: Int = 68
)

data class WorkoutRoutine(
    val id: String,
    val title: String,
    val targetGroup: String,
    val durationMin: Int,
    val burnKcal: Int,
    val difficulty: String,
    val exercisesCount: Int
)

data class AthleteProfile(
    val name: String = "RANA X",
    val title: String = "Apex Functional Athlete",
    val maxBenchKg: Double = 142.5,
    val totalWorkouts: Int = 188,
    val currentDietPlan: DietPlan? = null
)
