package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.WorkoutRoutine
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.NeonPurple
import com.example.ui.theme.NeonRed
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextMuted

@Composable
fun WorkoutsScreen(
    onStartWorkout: (WorkoutRoutine) -> Unit,
    modifier: Modifier = Modifier
) {
    val routines = remember {
        listOf(
            WorkoutRoutine(
                id = "w1",
                title = "HYPERTROPHY CHEST & ANTERIOR DELTS",
                targetGroup = "Upper Push Focus",
                durationMin = 52,
                burnKcal = 540,
                difficulty = "ADVANCED",
                exercisesCount = 6
            ),
            WorkoutRoutine(
                id = "w2",
                title = "POSTERIOR CHAIN DEADLIFT MATRIX",
                targetGroup = "Hamstrings, Lats, Spinal Erectors",
                durationMin = 65,
                burnKcal = 680,
                difficulty = "ELITE",
                exercisesCount = 5
            ),
            WorkoutRoutine(
                id = "w3",
                title = "QUAD FOCUSED SQUAT OVERLOAD",
                targetGroup = "Vastus Medialis, Glutes, Calves",
                durationMin = 58,
                burnKcal = 610,
                difficulty = "ADVANCED",
                exercisesCount = 6
            ),
            WorkoutRoutine(
                id = "w4",
                title = "ANAEROBIC VO2 MAX CONDITIONING",
                targetGroup = "Full Body Metabolic Circuit",
                durationMin = 30,
                burnKcal = 420,
                difficulty = "INTENSE",
                exercisesCount = 7
            )
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0C))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "COMBAT PROTOCOLS",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "High-Intensity Progressive Overload Programs",
                    color = TextMuted,
                    fontSize = 10.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(routines, key = { it.id }) { routine ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(SurfaceDark)
                        .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(20.dp))
                        .padding(16.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = routine.difficulty,
                                color = if (routine.difficulty == "ELITE") NeonRed else NeonCyan,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "${routine.burnKcal} KCAL",
                                color = NeonCyan,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = routine.title,
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = routine.targetGroup,
                            color = TextMuted,
                            fontSize = 11.sp
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${routine.exercisesCount} EXERCISES • ${routine.durationMin} MIN",
                                color = Color(0xFFB0B0B8),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )

                            Button(
                                onClick = { onStartWorkout(routine) },
                                modifier = Modifier.testTag("start_workout_${routine.id}_button"),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PlayArrow,
                                    contentDescription = "Start",
                                    tint = Color.Black,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "LAUNCH",
                                    color = Color.Black,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
