package com.example.service

import com.example.model.ChatMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object AiCoachEngine {
    var geminiApiKey: String = ""

    const val SYSTEM_INSTRUCTION =
        "You are RANA X Coach, a highly advanced AI acting as an elite gym trainer, clinical dietician, physiotherapist, and dermatologist. Always reply in friendly, conversational, and easy-to-understand Hinglish or English. Gracefully handle user typos and spelling mistakes using advanced NLP context."

    fun getCurrentTimestamp(): String {
        return SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
    }

    suspend fun generateResponse(prompt: String, apiKeyOverride: String? = null): ChatMessage = withContext(Dispatchers.IO) {
        val timestamp = getCurrentTimestamp()
        val id = "ai-${System.currentTimeMillis()}"

        val activeKey = (apiKeyOverride ?: geminiApiKey).trim()

        if (activeKey.isEmpty()) {
            return@withContext ChatMessage(
                id = id,
                sender = "ai",
                text = "⚠️ RANA X Coach is currently under maintenance. We are upgrading our neural engines. Please try again later.",
                timestamp = timestamp
            )
        }

        try {
            val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$activeKey"
            val url = URL(endpoint)
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                connectTimeout = 15000
                readTimeout = 25000
                doOutput = true
                doInput = true
            }

            // Build request payload matching Gemini generateContent spec
            val payload = JSONObject().apply {
                put("systemInstruction", JSONObject().apply {
                    put("parts", JSONArray().apply {
                        put(JSONObject().apply {
                            put("text", SYSTEM_INSTRUCTION)
                        })
                    })
                })
                put("contents", JSONArray().apply {
                    put(JSONObject().apply {
                        put("role", "user")
                        put("parts", JSONArray().apply {
                            put(JSONObject().apply {
                                put("text", prompt)
                            })
                        })
                    })
                })
            }

            OutputStreamWriter(conn.outputStream).use { writer ->
                writer.write(payload.toString())
                writer.flush()
            }

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                val rawResponse = BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
                val json = JSONObject(rawResponse)
                val candidates = json.optJSONArray("candidates")
                val firstCandidate = candidates?.optJSONObject(0)
                val content = firstCandidate?.optJSONObject("content")
                val parts = content?.optJSONArray("parts")
                val reply = parts?.optJSONObject(0)?.optString("text")
                    ?: "No response text received from Gemini Neural Engine."

                return@withContext ChatMessage(
                    id = id,
                    sender = "ai",
                    text = reply,
                    timestamp = timestamp
                )
            } else {
                val errorText = conn.errorStream?.let {
                    BufferedReader(InputStreamReader(it)).use { reader -> reader.readText() }
                } ?: ""
                val errorMsg = try {
                    JSONObject(errorText).optJSONObject("error")?.optString("message") ?: errorText
                } catch (e: Exception) {
                    errorText
                }
                throw Exception("HTTP $responseCode: $errorMsg")
            }
        } catch (e: Exception) {
            ChatMessage(
                id = id,
                sender = "ai",
                text = "⚠️ RANA X Coach is currently under maintenance. We are upgrading our neural engines. Please try again later.",
                timestamp = timestamp
            )
        }
    }
}
