package com.example.ui

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AthleteProfile
import com.example.model.DailyActivity
import com.example.model.DietPlan
import com.example.model.WorkoutRoutine
import com.example.ui.screens.AiCoachScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.WorkoutsScreen
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.NeonRed
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextDim
import com.example.ui.theme.TextMuted
import kotlinx.coroutines.launch

@Composable
fun RanaApp() {
    // Default initial route set to Dashboard
    var currentTab by remember { mutableStateOf("dashboard") }
    var activity by remember { mutableStateOf(DailyActivity()) }
    var profile by remember { mutableStateOf(AthleteProfile()) }
    var activeDietPlan by remember { mutableStateOf<DietPlan?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(0xFF0A0A0C),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            NavigationBar(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(horizontal = 12.dp, vertical = 6.dp)
                    .clip(RoundedCornerShape(28.dp))
                    .background(Color(0xFF13131A))
                    .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(28.dp)),
                containerColor = Color(0xFF13131A),
                tonalElevation = 8.dp
            ) {
                // Tab 1: Dashboard
                NavigationBarItem(
                    selected = currentTab == "dashboard",
                    onClick = { currentTab = "dashboard" },
                    modifier = Modifier.testTag("nav_tab_dashboard"),
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Home,
                            contentDescription = "Dashboard",
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "Dashboard",
                            fontSize = 9.sp,
                            fontWeight = if (currentTab == "dashboard") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = NeonCyan,
                        selectedTextColor = NeonCyan,
                        unselectedIconColor = TextDim,
                        unselectedTextColor = TextDim,
                        indicatorColor = NeonCyan.copy(alpha = 0.15f)
                    )
                )

                // Tab 2: Workouts
                NavigationBarItem(
                    selected = currentTab == "workouts",
                    onClick = { currentTab = "workouts" },
                    modifier = Modifier.testTag("nav_tab_workouts"),
                    icon = {
                        Icon(
                            imageVector = Icons.Default.FitnessCenter,
                            contentDescription = "Workouts",
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "Workouts",
                            fontSize = 9.sp,
                            fontWeight = if (currentTab == "workouts") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = NeonCyan,
                        selectedTextColor = NeonCyan,
                        unselectedIconColor = TextDim,
                        unselectedTextColor = TextDim,
                        indicatorColor = NeonCyan.copy(alpha = 0.15f)
                    )
                )

                // Tab 3: AI Coach (Primary)
                NavigationBarItem(
                    selected = currentTab == "coach",
                    onClick = { currentTab = "coach" },
                    modifier = Modifier.testTag("nav_tab_coach"),
                    icon = {
                        Icon(
                            imageVector = Icons.Default.SmartToy,
                            contentDescription = "AI Coach",
                            modifier = Modifier.size(22.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "AI Coach",
                            fontSize = 9.sp,
                            fontWeight = if (currentTab == "coach") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = NeonRed,
                        selectedTextColor = NeonRed,
                        unselectedIconColor = TextDim,
                        unselectedTextColor = TextDim,
                        indicatorColor = NeonRed.copy(alpha = 0.15f)
                    )
                )

                // Tab 4: Profile
                NavigationBarItem(
                    selected = currentTab == "profile",
                    onClick = { currentTab = "profile" },
                    modifier = Modifier.testTag("nav_tab_profile"),
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profile",
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "Profile",
                            fontSize = 9.sp,
                            fontWeight = if (currentTab == "profile") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = NeonCyan,
                        selectedTextColor = NeonCyan,
                        unselectedIconColor = TextDim,
                        unselectedTextColor = TextDim,
                        indicatorColor = NeonCyan.copy(alpha = 0.15f)
                    )
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentTab) {
                "coach" -> {
                    AiCoachScreen(
                        onApplyDiet = { plan ->
                            activeDietPlan = plan
                            activity = activity.copy(
                                caloriesTarget = plan.calories,
                                waterTargetLiters = if (plan.calories > 3000) 4.2 else 3.8
                            )
                            profile = profile.copy(currentDietPlan = plan)
                            scope.launch {
                                snackbarHostState.showSnackbar("⚡ Applied: Daily target updated to ${plan.calories} KCAL on Dashboard!")
                            }
                            Toast.makeText(
                                context,
                                "Synced to Dashboard: ${plan.calories} kcal",
                                Toast.LENGTH_SHORT
                            ).show()
                        },
                        onSaveDietToProfile = { plan ->
                            activeDietPlan = plan
                            profile = profile.copy(currentDietPlan = plan)
                            scope.launch {
                                snackbarHostState.showSnackbar("🥩 Saved \"${plan.title}\" to Athlete Profile.")
                            }
                            Toast.makeText(
                                context,
                                "Saved to Profile: ${plan.title}",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    )
                }
                "dashboard" -> {
                    DashboardScreen(
                        activity = activity,
                        activeDietPlan = activeDietPlan,
                        onQuickLogCalorie = { addedKcal ->
                            activity = activity.copy(
                                caloriesBurned = activity.caloriesBurned + addedKcal
                            )
                            scope.launch {
                                snackbarHostState.showSnackbar("Logged +$addedKcal kcal to metabolic burn!")
                            }
                        }
                    )
                }
                "workouts" -> {
                    WorkoutsScreen(
                        onStartWorkout = { routine ->
                            activity = activity.copy(
                                caloriesBurned = activity.caloriesBurned + routine.burnKcal,
                                activeMinutes = activity.activeMinutes + routine.durationMin
                            )
                            scope.launch {
                                snackbarHostState.showSnackbar("Launched ${routine.title}! (+${routine.burnKcal} kcal)")
                            }
                        }
                    )
                }
                "profile" -> {
                    ProfileScreen(
                        profile = profile,
                        activeDietPlan = activeDietPlan
                    )
                }
            }
        }
    }
}
