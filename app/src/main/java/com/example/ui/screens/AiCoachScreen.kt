package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.clickable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ChatMessage
import com.example.model.DietPlan
import com.example.model.FormTelemetry
import com.example.model.RmPrediction
import com.example.service.AiCoachEngine
import com.example.ui.theme.CardDark
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.NeonGreen
import com.example.ui.theme.NeonPurple
import com.example.ui.theme.NeonRed
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextDim
import com.example.ui.theme.TextMuted
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ActionChipItem(
    val id: String,
    val label: String,
    val prompt: String,
    val color: Color
)

@Composable
fun AiCoachScreen(
    onApplyDiet: (DietPlan) -> Unit,
    onSaveDietToProfile: (DietPlan) -> Unit,
    modifier: Modifier = Modifier
) {
    val actionChips = remember {
        listOf(
            ActionChipItem(
                id = "gain",
                label = "🥩 Generate Weight Gain Macros",
                prompt = "Generate an elite Weight Gain Diet Plan and high-protein surplus macros",
                color = NeonCyan
            ),
            ActionChipItem(
                id = "cut",
                label = "📉 Create Fat Loss Diet Plan",
                prompt = "Create a precision Fat Loss Diet Plan with macro split and peri-workout nutrition",
                color = NeonRed
            ),
            ActionChipItem(
                id = "form",
                label = "🏋️ Analyze Form (Camera)",
                prompt = "Analyze my deadlift and back squat form kinematics with computer vision biomechanics",
                color = NeonPurple
            ),
            ActionChipItem(
                id = "rm",
                label = "📊 1-Rep Max Predictor",
                prompt = "Run neural 1-Rep Max predictor telemetry for bench press based on 125kg x 5 reps",
                color = NeonCyan
            ),
            ActionChipItem(
                id = "pre",
                label = "⚡ Pre-Workout Fuel Matrix",
                prompt = "Clinical pre-workout timing, citrulline dosage and rapid carbohydrate fueling",
                color = NeonRed
            )
        )
    }

    var geminiApiKey by remember { mutableStateOf(AiCoachEngine.geminiApiKey) }

    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMessage(
                    id = "init-1",
                    sender = "ai",
                    text = "⚡ **RANA X Coach live AI online**\n\nConnected to Gemini 2.0 Flash REST API. Ask any clinical dietetics, physio, derma, or training questions, or tap an action chip above.",
                    timestamp = AiCoachEngine.getCurrentTimestamp()
                )
            )
        )
    }

    var inputText by remember { mutableStateOf("") }
    var isThinking by remember { mutableStateOf(false) }
    var isListening by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    if (isListening) {
        LaunchedEffect(isListening) {
            delay(2600)
            inputText = "Suggest 2,400 kcal cutting macros with 200g protein"
            isListening = false
        }
    }

    fun sendMessage(queryText: String) {
        val q = queryText.trim()
        if (q.isEmpty() || isThinking) return

        val userMsg = ChatMessage(
            id = "usr-${System.currentTimeMillis()}",
            sender = "user",
            text = q,
            timestamp = AiCoachEngine.getCurrentTimestamp()
        )
        messages = messages + userMsg
        inputText = ""
        isThinking = true

        scope.launch {
            listState.animateScrollToItem(messages.size)
            delay(400)
            val aiMsg = AiCoachEngine.generateResponse(q, geminiApiKey)
            messages = messages + aiMsg
            isThinking = false
            delay(100)
            listState.animateScrollToItem(messages.size)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0C))
    ) {
        // AI Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceDark)
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF1E222D))
                        .border(1.dp, NeonCyan, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.SmartToy,
                        contentDescription = "RANA AI",
                        tint = NeonCyan,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "RANA X Coach",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(NeonCyan.copy(alpha = 0.15f))
                                .border(1.dp, NeonCyan.copy(alpha = 0.5f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 5.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "Dietician | Physio | Derma | Coach",
                                color = NeonCyan,
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Text(
                        text = "Autonomous Biomechanics & Precision Nutrition",
                        color = TextMuted,
                        fontSize = 10.sp
                    )
                }
            }

            IconButton(
                onClick = {
                    messages = listOf(
                        ChatMessage(
                            id = "init-reset",
                            sender = "ai",
                            text = "⚡ Conversation reset. RANA Clinical Dietetics Engine standing by.",
                            timestamp = AiCoachEngine.getCurrentTimestamp()
                        )
                    )
                },
                modifier = Modifier.testTag("reset_chat_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Reset Chat",
                    tint = TextMuted,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        // Horizontal Action Chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            actionChips.forEach { chip ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(chip.color.copy(alpha = 0.12f))
                        .border(1.dp, chip.color.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 12.dp, vertical = 7.dp)
                        .testTag("chip_${chip.id}")
                ) {
                    androidx.compose.foundation.text.ClickableText(
                        text = androidx.compose.ui.text.AnnotatedString(chip.label),
                        style = androidx.compose.ui.text.TextStyle(
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        onClick = { sendMessage(chip.prompt) }
                    )
                }
            }
        }

        // Chat Messages
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages, key = { it.id }) { msg ->
                val isUser = msg.sender == "user"
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(if (msg.dietPlan != null || msg.formTelemetry != null || msg.rmPrediction != null) 0.96f else 0.85f)
                            .clip(
                                RoundedCornerShape(
                                    topStart = 16.dp,
                                    topEnd = 16.dp,
                                    bottomStart = if (isUser) 16.dp else 2.dp,
                                    bottomEnd = if (isUser) 2.dp else 16.dp
                                )
                            )
                            .background(
                                if (isUser) NeonCyan.copy(alpha = 0.12f)
                                else SurfaceDark
                            )
                            .border(
                                width = 1.dp,
                                color = if (isUser) NeonCyan.copy(alpha = 0.5f) else Color(0x33FFFFFF),
                                shape = RoundedCornerShape(
                                    topStart = 16.dp,
                                    topEnd = 16.dp,
                                    bottomStart = if (isUser) 16.dp else 2.dp,
                                    bottomEnd = if (isUser) 2.dp else 16.dp
                                )
                            )
                            .padding(12.dp)
                    ) {
                        Column {
                            Text(
                                text = msg.text,
                                color = Color.White,
                                fontSize = 12.sp,
                                lineHeight = 18.sp
                            )

                            // Structured Glassmorphism Diet Plan Card
                            msg.dietPlan?.let { diet ->
                                Spacer(modifier = Modifier.height(10.dp))
                                DietPlanCardComposable(
                                    diet = diet,
                                    isApplied = msg.isApplied,
                                    isSaved = msg.isSaved,
                                    onApply = {
                                        messages = messages.map {
                                            if (it.id == msg.id) it.copy(isApplied = true) else it
                                        }
                                        onApplyDiet(diet)
                                    },
                                    onSave = {
                                        messages = messages.map {
                                            if (it.id == msg.id) it.copy(isSaved = true) else it
                                        }
                                        onSaveDietToProfile(diet)
                                    }
                                )
                            }

                            // Structured Form Telemetry Card
                            msg.formTelemetry?.let { form ->
                                Spacer(modifier = Modifier.height(10.dp))
                                FormTelemetryCardComposable(form = form)
                            }

                            // Structured 1-RM Predictor Card
                            msg.rmPrediction?.let { rm ->
                                Spacer(modifier = Modifier.height(10.dp))
                                RmPredictionCardComposable(rm = rm)
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = msg.timestamp,
                                color = TextDim,
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.align(Alignment.End)
                            )
                        }
                    }
                }
            }

            if (isThinking) {
                item {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(14.dp))
                            .background(SurfaceDark)
                            .border(1.dp, NeonCyan.copy(alpha = 0.45f), RoundedCornerShape(14.dp))
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(NeonCyan)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "typing...",
                            color = NeonCyan,
                            fontSize = 12.sp,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace
                        )
                    }
                }
            }
        }

        // Listening HUD Animation
        AnimatedVisibility(visible = isListening) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 4.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF151520))
                    .border(1.dp, NeonCyan.copy(alpha = 0.6f), RoundedCornerShape(14.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(NeonCyan)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "Listening...",
                            color = NeonCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Speak your query (diet, physio, 1RM, macros)...",
                            color = TextDim,
                            fontSize = 9.sp
                        )
                    }
                }
                Text(
                    text = "CANCEL",
                    color = TextMuted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .clickable { isListening = false }
                        .padding(horizontal = 6.dp, vertical = 3.dp)
                )
            }
        }

        // Chat Input Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(SurfaceDark)
                .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(24.dp))
                .padding(horizontal = 6.dp, vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { isListening = !isListening },
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(if (isListening) NeonRed.copy(alpha = 0.2f) else NeonCyan.copy(alpha = 0.12f))
                    .border(1.dp, if (isListening) NeonRed else NeonCyan.copy(alpha = 0.4f), CircleShape)
                    .testTag("mic_voice_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Mic,
                    contentDescription = "Voice input",
                    tint = if (isListening) NeonRed else NeonCyan,
                    modifier = Modifier.size(18.dp)
                )
            }

            TextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = {
                    Text(
                        "Ask Dietitian, Physio, Derma, Coach...",
                        color = TextDim,
                        fontSize = 11.sp
                    )
                },
                modifier = Modifier
                    .weight(1f)
                    .testTag("chat_input_field"),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = { sendMessage(inputText) }),
                singleLine = true
            )

            IconButton(
                onClick = { sendMessage(inputText) },
                enabled = inputText.isNotBlank() && !isThinking,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(if (inputText.isNotBlank() && !isThinking) NeonCyan else Color.Transparent)
                    .testTag("send_message_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    tint = if (inputText.isNotBlank() && !isThinking) Color.Black else TextDim,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}

@Composable
fun DietPlanCardComposable(
    diet: DietPlan,
    isApplied: Boolean,
    isSaved: Boolean,
    onApply: () -> Unit,
    onSave: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFF101016))
            .border(1.dp, NeonCyan.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
            .padding(12.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = diet.title,
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(NeonCyan.copy(alpha = 0.15f))
                        .border(1.dp, NeonCyan.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = diet.targetGoal,
                        color = NeonCyan,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Total Calories Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF161622))
                    .border(1.dp, Color(0x22FFFFFF), RoundedCornerShape(10.dp))
                    .padding(8.dp)
            ) {
                Column {
                    Text(
                        text = "TOTAL DAILY CALORIC CEILING",
                        color = TextMuted,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = "${diet.calories}",
                            color = Color.White,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "KCAL / DAY",
                            color = NeonRed,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Macro Split Visualizer
            Text(
                text = "MACRO SPLIT VISUALIZER",
                color = TextMuted,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp))
            ) {
                Box(
                    modifier = Modifier
                        .weight(diet.proteinPct.toFloat())
                        .fillMaxSize()
                        .background(NeonCyan)
                )
                Box(
                    modifier = Modifier
                        .weight(diet.carbsPct.toFloat())
                        .fillMaxSize()
                        .background(NeonRed)
                )
                Box(
                    modifier = Modifier
                        .weight(diet.fatsPct.toFloat())
                        .fillMaxSize()
                        .background(NeonPurple)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 3 Macro Pillars
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

            Spacer(modifier = Modifier.height(8.dp))

            // Peri-Workout Boxes
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF161622))
                    .padding(8.dp)
            ) {
                Column {
                    Text(
                        text = "⚡ Pre-Workout (T - 35m)",
                        color = NeonCyan,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = diet.preWorkout,
                        color = Color.White,
                        fontSize = 10.sp,
                        lineHeight = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF161622))
                    .padding(8.dp)
            ) {
                Column {
                    Text(
                        text = "🛡️ Post-Workout (T + 45m)",
                        color = NeonRed,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = diet.postWorkout,
                        color = Color.White,
                        fontSize = 10.sp,
                        lineHeight = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onSave,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("save_diet_plan_button"),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isSaved) NeonGreen else Color(0x44FFFFFF)
                    ),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (isSaved) NeonGreen.copy(alpha = 0.15f) else Color.Transparent
                    )
                ) {
                    Text(
                        text = if (isSaved) "✓ SAVED" else "SAVE TO PROFILE",
                        color = if (isSaved) NeonGreen else Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Button(
                    onClick = onApply,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("apply_diet_plan_button"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isApplied) NeonGreen else NeonCyan
                    )
                ) {
                    Text(
                        text = if (isApplied) "✓ SYNCED" else "APPLY TO APP",
                        color = Color.Black,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }
    }
}

@Composable
fun MacroPillarComposable(
    label: String,
    grams: String,
    pct: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF161622))
            .border(1.dp, color.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
            .padding(6.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = label, color = color, fontSize = 8.sp, fontWeight = FontWeight.Bold)
            Text(
                text = grams,
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace
            )
            Text(text = pct, color = TextMuted, fontSize = 8.sp)
        }
    }
}

@Composable
fun FormTelemetryCardComposable(form: FormTelemetry) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFF101016))
            .border(1.dp, NeonPurple.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
            .padding(12.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = form.exercise,
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${form.confidencePct}% CONFIDENCE",
                    color = NeonGreen,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "PRIMARY KINEMATIC DEVIATION:",
                color = NeonRed,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = form.primaryRisk,
                color = Color.White,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "BIOMECHANICAL CUE:",
                color = NeonCyan,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = form.kinematicsCue,
                color = TextMuted,
                fontSize = 10.sp,
                lineHeight = 14.sp
            )
        }
    }
}

@Composable
fun RmPredictionCardComposable(rm: RmPrediction) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFF101016))
            .border(1.dp, NeonCyan.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
            .padding(12.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = rm.exercise,
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "NEURAL REGRESSION",
                    color = NeonCyan,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = "${rm.predictedRmKg} KG",
                    color = NeonCyan,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "PREDICTED 1-RM",
                    color = TextMuted,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Overload: ${rm.targetOverload}",
                color = Color.White,
                fontSize = 10.sp
            )
        }
    }
}
