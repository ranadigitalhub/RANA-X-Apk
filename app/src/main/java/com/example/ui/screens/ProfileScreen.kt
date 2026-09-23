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
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.foundation.clickable
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AthleteProfile
import com.example.model.DietPlan
import com.example.ui.theme.CardDark
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.NeonGreen
import com.example.ui.theme.NeonPurple
import com.example.ui.theme.NeonRed
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextDim
import com.example.ui.theme.TextMuted

@Composable
fun ProfileScreen(
    profile: AthleteProfile,
    activeDietPlan: DietPlan?,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    var isEditingName by remember { mutableStateOf(false) }
    var currentName by remember { mutableStateOf(profile.name) }
    var selectedFont by remember { mutableStateOf("System") }
    var selectedColor by remember { mutableStateOf(Color.White) }

    val fontOptions = listOf("System", "Cyber", "Athletic", "Neon")
    val colorSwatches = listOf(
        Color.White,
        NeonCyan,
        NeonGreen,
        Color(0xFFFFD600),
        Color(0xFFFF007F),
        NeonRed,
        NeonPurple,
        Color(0xFFFF6D00)
    )

    val currentFontFamily = when (selectedFont) {
        "Cyber" -> FontFamily.Monospace
        "Athletic" -> FontFamily.SansSerif
        "Neon" -> FontFamily.Cursive
        else -> FontFamily.Default
    }
    val currentLetterSpacing = when (selectedFont) {
        "Athletic" -> 2.sp
        "Neon" -> 3.sp
        "Cyber" -> 1.sp
        else -> 0.sp
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0C))
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Profile Card with Mirror Glow Avatar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(SurfaceDark)
                .border(1.dp, NeonCyan.copy(alpha = 0.4f), RoundedCornerShape(24.dp))
                .padding(18.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF1E222D))
                        .border(2.dp, NeonCyan, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Profile",
                        tint = NeonCyan,
                        modifier = Modifier.size(36.dp)
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    if (!isEditingName) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = currentName,
                                color = selectedColor,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = currentFontFamily,
                                letterSpacing = currentLetterSpacing
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(NeonCyan.copy(alpha = 0.15f))
                                    .border(1.dp, NeonCyan.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                                    .clickable { isEditingName = true },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Edit,
                                    contentDescription = "Edit name",
                                    tint = NeonCyan,
                                    modifier = Modifier.size(13.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(NeonCyan.copy(alpha = 0.2f))
                                    .padding(horizontal = 4.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "LEVEL 48",
                                    color = NeonCyan,
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                BasicTextField(
                                    value = currentName,
                                    onValueChange = { currentName = it },
                                    textStyle = TextStyle(
                                        color = selectedColor,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = currentFontFamily,
                                        letterSpacing = currentLetterSpacing
                                    ),
                                    singleLine = true,
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color(0xFF14151B))
                                        .border(1.dp, NeonCyan, RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(NeonCyan)
                                        .clickable { isEditingName = false },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Save name",
                                        tint = Color.Black,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            // Glassmorphic Control Panel
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFF101116).copy(alpha = 0.9f))
                                    .border(1.dp, NeonCyan.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                    .padding(10.dp)
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    // Font Selector
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "FONT SELECTOR",
                                            color = TextDim,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = selectedFont,
                                            color = NeonCyan,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Row(
                                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        fontOptions.forEach { fontOption ->
                                            val isSelected = selectedFont == fontOption
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(8.dp))
                                                    .background(
                                                        if (isSelected) NeonCyan.copy(alpha = 0.2f)
                                                        else Color(0xFF1A1D26)
                                                    )
                                                    .border(
                                                        1.dp,
                                                        if (isSelected) selectedColor else Color.White.copy(alpha = 0.1f),
                                                        RoundedCornerShape(8.dp)
                                                    )
                                                    .clickable { selectedFont = fontOption }
                                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                                            ) {
                                                Text(
                                                    text = fontOption,
                                                    color = if (isSelected) selectedColor else Color(0xFFAAAAAA),
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }
                                    }

                                    // Isolated Text Color Swatches
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "TEXT COLOR (ISOLATED)",
                                            color = TextDim,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Row(
                                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        colorSwatches.forEach { swatch ->
                                            val isSelected = selectedColor == swatch
                                            Box(
                                                modifier = Modifier
                                                    .size(20.dp)
                                                    .clip(CircleShape)
                                                    .background(swatch)
                                                    .border(
                                                        if (isSelected) 2.dp else 0.dp,
                                                        Color.White,
                                                        CircleShape
                                                    )
                                                    .clickable { selectedColor = swatch }
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Text(
                        text = profile.title,
                        color = TextMuted,
                        fontSize = 11.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${profile.totalWorkouts} Combat Sessions Completed",
                        color = NeonGreen,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Active Clinical Diet Protocol (if saved/synced)
        activeDietPlan?.let { diet ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF12141E))
                    .border(1.dp, NeonCyan.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = "Diet",
                                tint = NeonCyan,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "ACTIVE CLINICAL DIET PROTOCOL",
                                color = NeonCyan,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                        Text(
                            text = "SYNCHRONIZED",
                            color = NeonGreen,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = diet.title,
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "${diet.targetGoal} • ${diet.calories} KCAL / DAY",
                        color = TextMuted,
                        fontSize = 11.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        MacroPillarComposable(
                            label = "PROTEIN",
                            grams = "${diet.proteinGrams}g",
                            pct = "${diet.proteinPct}%",
                            color = NeonCyan,
                            modifier = Modifier.weight(1f)
                        )
                        MacroPillarComposable(
                            label = "CARBS",
                            grams = "${diet.carbsGrams}g",
                            pct = "${diet.carbsPct}%",
                            color = NeonRed,
                            modifier = Modifier.weight(1f)
                        )
                        MacroPillarComposable(
                            label = "FATS",
                            grams = "${diet.fatsGrams}g",
                            pct = "${diet.fatsPct}%",
                            color = NeonPurple,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        // Biometric Stats
        Text(
            text = "BIOMECHANICAL BENCHMARKS",
            color = TextMuted,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )

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
                    Text(text = "MAX BENCH PRESS", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${profile.maxBenchKg} KG",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(text = "Autoregulated 1-RM", color = NeonCyan, fontSize = 9.sp)
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
                    Text(text = "MIRROR GLOW MODE", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "NEON ULTRA",
                        color = NeonRed,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(text = "Active Cyber Aura", color = TextDim, fontSize = 9.sp)
                }
            }
        }
    }
}
