package com.example.ui.screens

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.DailyActivity
import com.example.model.DietPlan
import com.example.ui.theme.CardDark
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.NeonGreen
import com.example.ui.theme.NeonPurple
import com.example.ui.theme.NeonRed
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextDim
import com.example.ui.theme.TextMuted
import kotlinx.coroutines.delay

enum class NutriScanStatus {
    IDLE,
    ANALYZING,
    FOOD_DETECTED,
    NON_FOOD_DETECTED
}

data class ScannedMealResult(
    val name: String,
    val type: String,
    val calories: Int,
    val protein: Int,
    val carbs: Int,
    val fats: Int,
    val confidence: Int,
    val vitamins: List<Triple<String, String, Color>>
)

@Composable
fun DashboardScreen(
    activity: DailyActivity,
    activeDietPlan: DietPlan?,
    onQuickLogCalorie: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    var showNutriLens by remember { mutableStateOf(false) }
    var selectedMealBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var isAnalyzing by remember { mutableStateOf(false) }
    var analysisComplete by remember { mutableStateOf(false) }
    var isError by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()
    var analysisJob by remember { mutableStateOf<Job?>(null) }

    val triggerAnalysis: (Bitmap) -> Unit = { bitmap ->
        selectedMealBitmap = bitmap
        analysisJob?.cancel()
        isAnalyzing = true
        analysisComplete = false
        analysisJob = coroutineScope.launch {
            delay(3000)
            isAnalyzing = false
            analysisComplete = true
        }
    }

    val closeNutriLens: () -> Unit = {
        analysisJob?.cancel()
        selectedMealBitmap = null
        isAnalyzing = false
        analysisComplete = false
        isError = false
        showNutriLens = false
    }

    // Native Camera Launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            triggerAnalysis(bitmap)
        }
    }

    // Native Gallery Image Picker Launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            try {
                val inputStream = context.contentResolver.openInputStream(uri)
                val bitmap = BitmapFactory.decodeStream(inputStream)
                if (bitmap != null) {
                    triggerAnalysis(bitmap)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0C))
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "RANA ",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                    Text(
                        text = "X",
                        color = NeonCyan,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black
                    )
                }
                Text(
                    text = "MIRROR GLOW FITNESS MATRIX",
                    color = TextMuted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(20.dp))
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(NeonGreen)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${activity.streakDays} DAY STREAK",
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Active Diet Callout if synced from AI Coach
        activeDietPlan?.let { diet ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(NeonCyan.copy(alpha = 0.08f))
                    .border(1.dp, NeonCyan.copy(alpha = 0.5f), RoundedCornerShape(18.dp))
                    .padding(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = "Active",
                                tint = NeonCyan,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "ACTIVE DIET PROTOCOL",
                                color = NeonCyan,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = diet.title,
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(NeonCyan.copy(alpha = 0.2f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${diet.calories} KCAL",
                            color = NeonCyan,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }

        // Main Activity Ring Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(SurfaceDark)
                .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(24.dp))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(150.dp)
                        .clip(CircleShape)
                        .border(10.dp, NeonRed.copy(alpha = 0.2f), CircleShape)
                        .padding(8.dp)
                        .border(6.dp, NeonCyan, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.LocalFireDepartment,
                            contentDescription = "Burned",
                            tint = NeonRed,
                            modifier = Modifier.size(22.dp)
                        )
                        Text(
                            text = "${activity.caloriesBurned}",
                            color = Color.White,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "KCAL",
                            color = NeonCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))
                Text(
                    text = "TARGET: ${activity.caloriesTarget} KCAL",
                    color = TextMuted,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "Synchronized from RANA Clinical Dietitian",
                    color = TextDim,
                    fontSize = 10.sp
                )
            }
        }

        // Large Glowing Prominent Action Button: Scan Meal
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF08121A))
                .border(2.dp, NeonCyan, RoundedCornerShape(20.dp))
                .clickable { showNutriLens = true }
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(NeonCyan.copy(alpha = 0.2f))
                            .border(1.dp, NeonCyan, RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "📷", fontSize = 22.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Scan Meal",
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(NeonCyan.copy(alpha = 0.2f))
                                    .border(1.dp, NeonCyan.copy(alpha = 0.6f), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "NUTRI-LENS",
                                    color = NeonCyan,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Text(
                            text = "AI Macro & Vitamin Telemetry",
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                Text(
                    text = "➔",
                    color = NeonCyan,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Quick Stats Row (Water & Active Min)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceDark)
                    .border(1.dp, Color(0x22FFFFFF), RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.WaterDrop,
                            contentDescription = "Water",
                            tint = NeonCyan,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "HYDRATION", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${activity.waterLiters}L / ${activity.waterTargetLiters}L",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceDark)
                    .border(1.dp, Color(0x22FFFFFF), RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = "Active Time",
                            tint = NeonPurple,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "ACTIVE TIME", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${activity.activeMinutes} MIN",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }

        // Quick Log Buttons
        Text(
            text = "QUICK METABOLIC OVERRIDE",
            color = TextMuted,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = { onQuickLogCalorie(150) },
                modifier = Modifier.weight(1f).testTag("quick_log_150_button"),
                border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("+150 KCAL", color = NeonCyan, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }

            OutlinedButton(
                onClick = { onQuickLogCalorie(300) },
                modifier = Modifier.weight(1f).testTag("quick_log_300_button"),
                border = androidx.compose.foundation.BorderStroke(1.dp, NeonRed.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("+300 KCAL", color = NeonRed, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }

            OutlinedButton(
                onClick = { onQuickLogCalorie(500) },
                modifier = Modifier.weight(1f).testTag("quick_log_500_button"),
                border = androidx.compose.foundation.BorderStroke(1.dp, NeonPurple.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("+500 KCAL", color = NeonPurple, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
        }
    }

    // Nutri-Lens Glassmorphic Modal Dialog
    if (showNutriLens) {
        val modalScrollState = rememberScrollState()

        Dialog(
            onDismissRequest = closeNutriLens,
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.78f))
                    .clickable { closeNutriLens() },
                contentAlignment = Alignment.BottomCenter
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .fillMaxHeight(0.75f)
                        .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                        .background(Color(0xFF0A0A0A))
                        .border(
                            width = 1.5.dp,
                            color = NeonCyan,
                            shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
                        )
                        .clickable(enabled = false) {}
                        .padding(horizontal = 20.dp, vertical = 14.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(modalScrollState),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Drag accent bar
                        Box(
                            modifier = Modifier
                                .width(44.dp)
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(NeonCyan.copy(alpha = 0.4f))
                                .align(Alignment.CenterHorizontally)
                        )

                        // 1. Top Header ('NUTRI-LENS' centrally positioned and close button)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Spacer(modifier = Modifier.width(36.dp))
                            Text(
                                text = "NUTRI-LENS",
                                color = NeonCyan,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 3.sp,
                                fontFamily = FontFamily.Monospace
                            )

                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.08f))
                                    .border(1.dp, Color.White.copy(alpha = 0.15f), CircleShape)
                                    .clickable { closeNutriLens() },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "✕", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        // 2. Row with two large interactive cyber buttons: 'Open Camera' and 'Upload from Gallery'
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Open Camera
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Color(0xFF0A131F))
                                    .border(1.5.dp, NeonCyan, RoundedCornerShape(16.dp))
                                    .clickable {
                                        cameraLauncher.launch(null)
                                    }
                                    .padding(vertical = 16.dp, horizontal = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(text = "📸", fontSize = 26.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(text = "Open Camera", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Black)
                                    Text(text = "LIVE SCANNER", color = NeonCyan, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                                }
                            }

                            // Upload from Gallery
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Color(0xFF091A14))
                                    .border(1.5.dp, NeonGreen, RoundedCornerShape(16.dp))
                                    .clickable {
                                        galleryLauncher.launch("image/*")
                                    }
                                    .padding(vertical = 16.dp, horizontal = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(text = "🖼️", fontSize = 26.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(text = "Upload from Gallery", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Black)
                                    Text(text = "SELECT PHOTO", color = NeonGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                                }
                            }
                        }

                        // 3. Dedicated, fixed-height empty container (height: 250.dp) for image preview
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(250.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0xFF05070B))
                                .border(
                                    width = 1.5.dp,
                                    color = if (selectedMealBitmap != null) NeonCyan else NeonCyan.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(16.dp)
                                )
                        ) {
                            if (selectedMealBitmap != null) {
                                Image(
                                    bitmap = selectedMealBitmap!!.asImageBitmap(),
                                    contentDescription = "Selected meal preview",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            }
                        }

                        // Glowing 'ANALYZING OPTICAL DATA...' loading indicator
                        if (isAnalyzing) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(NeonCyan.copy(alpha = 0.08f))
                                    .border(1.dp, NeonCyan.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                                    .padding(16.dp)
                            ) {
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(18.dp),
                                            color = NeonCyan,
                                            strokeWidth = 2.5.dp
                                        )
                                        Text(
                                            text = "ANALYZING OPTICAL DATA...",
                                            color = NeonCyan,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Monospace,
                                            letterSpacing = 1.5.sp
                                        )
                                    }

                                    // Glowing animated accent bar
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(4.dp)
                                            .clip(RoundedCornerShape(2.dp))
                                            .background(Color.White.copy(alpha = 0.1f))
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth(0.7f)
                                                .fillMaxHeight()
                                                .clip(RoundedCornerShape(2.dp))
                                                .background(NeonCyan)
                                        )
                                    }
                                }
                            }
                        }

                        // Non-Food Error UI (When isError === true)
                        if (analysisComplete && !isAnalyzing && isError) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Color(0xFF160507))
                                    .border(1.5.dp, NeonRed, RoundedCornerShape(16.dp))
                                    .padding(20.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "⚠️ NON-FOOD ITEM DETECTED. Please scan a valid biological meal.",
                                    color = NeonRed,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    letterSpacing = 0.8.sp,
                                    lineHeight = 20.sp,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }

                        // Redesigned Comprehensive Vertical Nutrient Breakdown Card (When isError === false)
                        if (analysisComplete && !isAnalyzing && !isError) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(18.dp))
                                    .background(Color(0xFF080C14))
                                    .border(1.5.dp, NeonCyan, RoundedCornerShape(18.dp))
                                    .padding(16.dp)
                            ) {
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    // RESTORE STATUS BAR: At the very top of the Nutrient Breakdown container, render the glowing status pill
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(24.dp))
                                            .background(NeonCyan.copy(alpha = 0.1f))
                                            .border(1.5.dp, NeonCyan, RoundedCornerShape(24.dp))
                                            .padding(vertical = 8.dp, horizontal = 16.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.Center
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(8.dp)
                                                    .clip(CircleShape)
                                                    .background(NeonCyan)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = "Status: Awaiting Server Response",
                                                color = NeonCyan,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                fontFamily = FontFamily.Monospace,
                                                letterSpacing = 0.8.sp
                                            )
                                        }
                                    }

                                    // Top Element: A large, full-width card showing ONLY 'Total Calories: -- kcal'
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(NeonCyan.copy(alpha = 0.08f))
                                            .border(1.5.dp, NeonCyan, RoundedCornerShape(14.dp))
                                            .padding(vertical = 18.dp, horizontal = 12.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = "Total Calories: -- kcal",
                                            color = NeonCyan,
                                            fontSize = 21.sp,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Monospace,
                                            letterSpacing = 0.5.sp,
                                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                        )
                                    }

                                    // Middle Element: A 2x2 grid for Macros (Protein: -- g, Carbs: -- g, Fats: -- g, Fiber: -- g)
                                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text(
                                            text = "MACRONUTRIENTS",
                                            color = Color.White.copy(alpha = 0.75f),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.5.sp
                                        )

                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            // Protein
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clip(RoundedCornerShape(12.dp))
                                                    .background(Color.White.copy(alpha = 0.03f))
                                                    .border(1.dp, NeonCyan.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
                                                    .padding(vertical = 12.dp, horizontal = 8.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                    Text(
                                                        text = "PROTEIN",
                                                        color = Color.White.copy(alpha = 0.6f),
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.ExtraBold,
                                                        letterSpacing = 1.sp
                                                    )
                                                    Spacer(modifier = Modifier.height(4.dp))
                                                    Text(
                                                        text = "Protein: -- g",
                                                        color = Color.White,
                                                        fontSize = 12.sp,
                                                        fontWeight = FontWeight.Black,
                                                        fontFamily = FontFamily.Monospace
                                                    )
                                                }
                                            }

                                            // Carbs
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clip(RoundedCornerShape(12.dp))
                                                    .background(Color.White.copy(alpha = 0.03f))
                                                    .border(1.dp, NeonCyan.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
                                                    .padding(vertical = 12.dp, horizontal = 8.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                    Text(
                                                        text = "CARBS",
                                                        color = Color.White.copy(alpha = 0.6f),
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.ExtraBold,
                                                        letterSpacing = 1.sp
                                                    )
                                                    Spacer(modifier = Modifier.height(4.dp))
                                                    Text(
                                                        text = "Carbs: -- g",
                                                        color = Color.White,
                                                        fontSize = 12.sp,
                                                        fontWeight = FontWeight.Black,
                                                        fontFamily = FontFamily.Monospace
                                                    )
                                                }
                                            }
                                        }

                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            // Fats
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clip(RoundedCornerShape(12.dp))
                                                    .background(Color.White.copy(alpha = 0.03f))
                                                    .border(1.dp, NeonCyan.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
                                                    .padding(vertical = 12.dp, horizontal = 8.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                    Text(
                                                        text = "FATS",
                                                        color = Color.White.copy(alpha = 0.6f),
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.ExtraBold,
                                                        letterSpacing = 1.sp
                                                    )
                                                    Spacer(modifier = Modifier.height(4.dp))
                                                    Text(
                                                        text = "Fats: -- g",
                                                        color = Color.White,
                                                        fontSize = 12.sp,
                                                        fontWeight = FontWeight.Black,
                                                        fontFamily = FontFamily.Monospace
                                                    )
                                                }
                                            }

                                            // Fiber
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clip(RoundedCornerShape(12.dp))
                                                    .background(Color.White.copy(alpha = 0.03f))
                                                    .border(1.dp, NeonCyan.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
                                                    .padding(vertical = 12.dp, horizontal = 8.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                    Text(
                                                        text = "FIBER",
                                                        color = Color.White.copy(alpha = 0.6f),
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.ExtraBold,
                                                        letterSpacing = 1.sp
                                                    )
                                                    Spacer(modifier = Modifier.height(4.dp))
                                                    Text(
                                                        text = "Fiber: -- g",
                                                        color = Color.White,
                                                        fontSize = 12.sp,
                                                        fontWeight = FontWeight.Black,
                                                        fontFamily = FontFamily.Monospace
                                                    )
                                                }
                                            }
                                        }
                                    }

                                    // Bottom Element: A distinct vertical list for Micro-nutrients
                                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text(
                                            text = "MICRONUTRIENTS",
                                            color = Color.White.copy(alpha = 0.75f),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.5.sp
                                        )

                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(12.dp))
                                                .background(Color.White.copy(alpha = 0.02f))
                                                .border(1.dp, NeonCyan.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                                                .padding(horizontal = 14.dp, vertical = 6.dp)
                                        ) {
                                            Column {
                                                listOf("Vitamin A", "Vitamin C", "Calcium", "Iron").forEachIndexed { idx, name ->
                                                    Row(
                                                        modifier = Modifier
                                                            .fillMaxWidth()
                                                            .padding(vertical = 10.dp),
                                                        horizontalArrangement = Arrangement.SpaceBetween,
                                                        verticalAlignment = Alignment.CenterVertically
                                                    ) {
                                                        Text(
                                                            text = name,
                                                            color = Color.White,
                                                            fontSize = 13.sp,
                                                            fontWeight = FontWeight.Bold,
                                                            letterSpacing = 0.5.sp
                                                        )
                                                        Box(
                                                            modifier = Modifier
                                                                .clip(RoundedCornerShape(8.dp))
                                                                .background(NeonCyan.copy(alpha = 0.08f))
                                                                .border(1.dp, NeonCyan.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                                                .padding(horizontal = 10.dp, vertical = 4.dp)
                                                        ) {
                                                            Text(
                                                                text = "-- %",
                                                                color = NeonCyan,
                                                                fontSize = 12.sp,
                                                                fontWeight = FontWeight.Black,
                                                                fontFamily = FontFamily.Monospace
                                                            )
                                                        }
                                                    }
                                                    if (idx < 3) {
                                                        Box(
                                                            modifier = Modifier
                                                                .fillMaxWidth()
                                                                .height(1.dp)
                                                                .background(Color.White.copy(alpha = 0.05f))
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}
