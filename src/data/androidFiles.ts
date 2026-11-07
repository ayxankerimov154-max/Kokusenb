export interface AndroidFile {
  id: string;
  name: string;
  path: string;
  language: 'xml' | 'kotlin' | 'groovy';
  category: 'manifest' | 'data' | 'service' | 'ai' | 'ui' | 'gradle';
  description: string;
  content: string;
}

export const ANDROID_FILES: AndroidFile[] = [
  {
    id: 'manifest',
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Manifest declaring INTERNET, FOREGROUND_SERVICE, FOREGROUND_SERVICE_SPECIAL_USE, WAKE_LOCK, and Android 14+ specialUse foreground service properties.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.technovisaze.learningbot">

    <!-- Network access to reach Google Gemini Generative AI endpoints -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Foreground Service permissions for continuous background operations -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <!-- Android 14+ (API 34) requires explicit specialUse foreground service permission -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

    <!-- WakeLock to maintain CPU execution during heavy gaming multitasking & screen-dim states -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Android 13+ (API 33) runtime notification permission for persistent status display -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Request ignoring battery optimizations so OEM skins don't kill background loops -->
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:name=".TechnovisAzeApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.TechnovisAzeLearningBot"
        tools:targetApi="34">

        <!-- Main Jetpack Compose User Interface Activity -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.TechnovisAzeLearningBot">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Persistent Background Learning Service with Android 14 specialUse specification -->
        <service
            android:name=".service.BackgroundLearningService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">

            <!-- Android 14+ requires PROPERTY_SPECIAL_USE_FGS_SUBTYPE detailing the exact operational rationale -->
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Autonomous gaming strategy analysis and Room DB indexing running silently in background without impacting gaming performance." />
        </service>

    </application>

</manifest>`
  },
  {
    id: 'entity',
    name: 'BotMemoryEntity.kt',
    path: 'app/src/main/java/com/technovisaze/learningbot/data/BotMemoryEntity.kt',
    language: 'kotlin',
    category: 'data',
    description: 'Updated Room Database Entity with gameVersion and timestampLearned fields for version-specific strategy tracking.',
    content: `package com.technovisaze.learningbot.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import androidx.room.TypeConverters

/**
 * Represents an autonomous gaming strategy item synthesized by the Gemini AI engine
 * and persisted locally in SQLite Room DB.
 * 
 * Schema Version 2 includes:
 * - gameVersion: tracks patch/version specific strategies (e.g. "v3.5", "1.21 Tricky Trials")
 * - timestampLearned: exact epoch millis when AI completed synthesis
 */
@Entity(
    tableName = "bot_memory",
    indices = [
        Index(value = ["game_name"]),
        Index(value = ["game_version"]),
        Index(value = ["timestamp_learned"])
    ]
)
@TypeConverters(Converters::class)
data class BotMemoryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,

    @ColumnInfo(name = "game_name")
    val gameName: String, // "PUBG Mobile", "Roblox", or "Minecraft"

    @ColumnInfo(name = "game_version")
    val gameVersion: String = "Latest Meta", // Specific game patch or release version

    @ColumnInfo(name = "strategy_category")
    val strategyCategory: String, // e.g. "Meta Tactics", "Survival & Loadout", "Speedrunning"

    @ColumnInfo(name = "insight_content")
    val insightContent: String, // Detailed synthesized strategic intelligence

    @ColumnInfo(name = "key_takeaways")
    val keyTakeaways: List<String>, // Bullet points for rapid player execution

    @ColumnInfo(name = "confidence_score")
    val confidenceScore: Float = 0.95f, // AI certainty rating (0.0 to 1.0)

    @ColumnInfo(name = "cycle_iteration")
    val cycleIteration: Int, // The nth sequential loop cycle (1, 2, 3...)

    @ColumnInfo(name = "execution_duration_ms")
    val executionDurationMs: Long = 0L, // Latency in ms for network & parsing

    @ColumnInfo(name = "model_version")
    val modelVersion: String = "gemini-3.8-flash", // Gemini model identifier

    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(), // Record creation epoch millis

    @ColumnInfo(name = "timestamp_learned")
    val timestampLearned: Long = System.currentTimeMillis() // Explicit epoch millis when AI learned strategy
)`
  },
  {
    id: 'converters',
    name: 'Converters.kt',
    path: 'app/src/main/java/com/technovisaze/learningbot/data/Converters.kt',
    language: 'kotlin',
    category: 'data',
    description: 'Room TypeConverters for serializing List<String> into database-compatible strings.',
    content: `package com.technovisaze.learningbot.data

import androidx.room.TypeConverter
import org.json.JSONArray

/**
 * Room TypeConverter to seamlessly serialize and deserialize List<String>
 * to and from JSON arrays without requiring heavy external dependencies.
 */
class Converters {

    @TypeConverter
    fun fromStringList(value: List<String>?): String {
        if (value.isNullOrEmpty()) return "[]"
        val jsonArray = JSONArray()
        for (item in value) {
            jsonArray.put(item)
        }
        return jsonArray.toString()
    }

    @TypeConverter
    fun toStringList(value: String?): List<String> {
        if (value.isNullOrEmpty() || value == "[]") return emptyList()
        val list = mutableListOf<String>()
        try {
            val jsonArray = JSONArray(value)
            for (i in 0 until jsonArray.length()) {
                list.add(jsonArray.getString(i))
            }
        } catch (e: Exception) {
            return value.split("||").filter { it.isNotBlank() }
        }
        return list
    }
}`
  },
  {
    id: 'dao',
    name: 'BotMemoryDao.kt',
    path: 'app/src/main/java/com/technovisaze/learningbot/data/BotMemoryDao.kt',
    language: 'kotlin',
    category: 'data',
    description: 'Data Access Object with reactive Kotlin Flows and version-specific queries.',
    content: `package com.technovisaze.learningbot.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object providing high-performance query and mutation interfaces
 * for the BotMemory database. Utilizes Kotlin Coroutines and Flows for reactive UI updates.
 */
@Dao
interface BotMemoryDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemory(memory: BotMemoryEntity): Long

    @Query("SELECT * FROM bot_memory ORDER BY timestamp_learned DESC")
    fun getAllMemories(): Flow<List<BotMemoryEntity>>

    @Query("SELECT * FROM bot_memory WHERE game_name = :gameName ORDER BY timestamp_learned DESC")
    fun getMemoriesForGame(gameName: String): Flow<List<BotMemoryEntity>>

    @Query("SELECT * FROM bot_memory WHERE game_name = :gameName AND game_version = :gameVersion ORDER BY timestamp_learned DESC")
    fun getMemoriesForGameVersion(gameName: String, gameVersion: String): Flow<List<BotMemoryEntity>>

    @Query("SELECT * FROM bot_memory ORDER BY timestamp_learned DESC LIMIT :limit")
    fun getRecentMemories(limit: Int): Flow<List<BotMemoryEntity>>

    @Query("SELECT COUNT(*) FROM bot_memory")
    suspend fun getMemoryCount(): Int

    @Query("SELECT COUNT(DISTINCT game_name) FROM bot_memory")
    suspend fun getUniqueGameCount(): Int

    @Query("DELETE FROM bot_memory")
    suspend fun clearAllMemories()

    @Query("DELETE FROM bot_memory WHERE timestamp_learned < :cutoffTimestamp")
    suspend fun pruneOldMemories(cutoffTimestamp: Long): Int
}`
  },
  {
    id: 'database',
    name: 'AppDatabase.kt',
    path: 'app/src/main/java/com/technovisaze/learningbot/data/AppDatabase.kt',
    language: 'kotlin',
    category: 'data',
    description: 'RoomDatabase Singleton updated to Schema Version 2 with MIGRATION_1_2 for game_version and timestamp_learned.',
    content: `package com.technovisaze.learningbot.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

/**
 * Room Database master container for TechnovisAze Learning Bot.
 * Version 2 introduces game_version and timestamp_learned columns.
 */
@Database(
    entities = [BotMemoryEntity::class],
    version = 2,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun botMemoryDao(): BotMemoryDao

    companion object {
        private const val DATABASE_NAME = "technovisaze_learning_bot.db"

        /**
         * Migration from Schema 1 to 2 adding game_version and timestamp_learned
         */
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE bot_memory ADD COLUMN game_version TEXT NOT NULL DEFAULT 'Latest Meta'")
                db.execSQL("ALTER TABLE bot_memory ADD COLUMN timestamp_learned INTEGER NOT NULL DEFAULT 0")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_bot_memory_game_version ON bot_memory(game_version)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_bot_memory_timestamp_learned ON bot_memory(timestamp_learned)")
            }
        }

        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    DATABASE_NAME
                )
                    .addMigrations(MIGRATION_1_2)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  {
    id: 'gemini-client',
    name: 'GeminiClient.kt',
    path: 'app/src/main/java/com/technovisaze/learningbot/ai/GeminiClient.kt',
    language: 'kotlin',
    category: 'ai',
    description: 'Gemini Client featuring version-specific prompt synthesis and resilient exponential backoff retry logic.',
    content: `package com.technovisaze.learningbot.ai

import android.util.Log
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.BlockThreshold
import com.google.ai.client.generativeai.type.HarmCategory
import com.google.ai.client.generativeai.type.SafetySetting
import com.google.ai.client.generativeai.type.generationConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * Strategy result data model returned from Gemini synthesis,
 * enriched with version specifications and timing metadata.
 */
data class GameStrategyResult(
    val gameName: String,
    val gameVersion: String,
    val category: String,
    val insights: String,
    val takeaways: List<String>,
    val confidence: Float,
    val durationMs: Long
)

/**
 * Gemini Generative AI Client wrapper configured for autonomous gaming intelligence analysis.
 * Implements exponential backoff retry logic and version-targeted prompt engineering.
 */
class GeminiClient(private val apiKey: String) {

    private val TAG = "TechnovisAzeGeminiClient"

    private val generativeModel = GenerativeModel(
        modelName = "gemini-3.8-flash",
        apiKey = apiKey,
        generationConfig = generationConfig {
            temperature = 0.6f
            topK = 32
            topP = 0.9f
            maxOutputTokens = 1024
        },
        safetySettings = listOf(
            SafetySetting(HarmCategory.HARASSMENT, BlockThreshold.NONE),
            SafetySetting(HarmCategory.HATE_SPEECH, BlockThreshold.NONE),
            SafetySetting(HarmCategory.SEXUALLY_EXPLICIT, BlockThreshold.NONE),
            SafetySetting(HarmCategory.DANGEROUS_CONTENT, BlockThreshold.NONE)
        )
    )

    /**
     * Executes the Gemini strategy generation with exponential backoff retry logic.
     * Retries up to [maxRetries] times with exponential delay (2s -> 4s -> 8s) on transient network or API errors.
     */
    suspend fun generateGameStrategyWithRetry(
        gameName: String,
        cycleIteration: Int,
        targetVersion: String? = null,
        maxRetries: Int = 3,
        initialDelayMs: Long = 2000L,
        maxDelayMs: Long = 20000L,
        backoffFactor: Double = 2.0
    ): Result<GameStrategyResult> = withContext(Dispatchers.IO) {
        var currentDelay = initialDelayMs
        var lastException: Exception? = null

        for (attempt in 1..maxRetries) {
            val startTime = System.currentTimeMillis()
            try {
                Log.d(TAG, "Gemini API attempt $attempt/$maxRetries for $gameName (targetVersion: $targetVersion)")
                val prompt = buildPromptForGame(gameName, cycleIteration, targetVersion)
                
                val response = generativeModel.generateContent(prompt)
                val responseText = response.text ?: throw IllegalStateException("Empty response body from Gemini API")
                val durationMs = System.currentTimeMillis() - startTime

                val parsedResult = parseGeminiResponse(gameName, responseText, durationMs, targetVersion)
                Log.i(TAG, "Gemini strategy synthesis succeeded for $gameName [$attempt/$maxRetries] in \${durationMs}ms")
                return@withContext Result.success(parsedResult)

            } catch (e: Exception) {
                lastException = e
                Log.w(TAG, "Gemini API call attempt $attempt failed for $gameName: \${e.message}. Backing off for \${currentDelay}ms...")
                
                if (attempt < maxRetries) {
                    delay(currentDelay)
                    currentDelay = (currentDelay * backoffFactor).toLong().coerceAtMost(maxDelayMs)
                }
            }
        }

        Log.e(TAG, "All $maxRetries Gemini API retry attempts exhausted for $gameName", lastException)
        Result.failure(lastException ?: IllegalStateException("Gemini API calls failed after $maxRetries retries"))
    }

    /**
     * Constructs tailored prompts designed for version-specific JSON tactical extractions.
     */
    private fun buildPromptForGame(gameName: String, cycleIteration: Int, targetVersion: String?): String {
        val versionClause = if (!targetVersion.isNullOrBlank()) {
            "Specifically analyze patch/version: \"$targetVersion\"."
        } else {
            "Identify and specify the current active competitive game version (e.g. for PUBG Mobile: 'v3.5 Icemire Frontier', for Minecraft: '1.21 Tricky Trials', for Roblox: 'Client 2026 Meta')."
        }

        return """
            You are an autonomous esports gaming intelligence agent analyzing competitive patterns for: "$gameName".
            Learning Loop Cycle: #$cycleIteration.
            $versionClause
            
            Synthesize the highest-priority meta tactics, combat strategies, and survival tips for this game.
            Format your response STRICTLY as a raw JSON object with NO markdown backticks:
            {
              "gameVersion": "Specific active version or patch name",
              "category": "Meta Tactics" | "Combat & Loadouts" | "Survival & Rotations" | "Speedrunning & Physics",
              "insights": "Detailed 2-paragraph tactical breakdown with pro-level actionable intelligence",
              "takeaways": [
                "Concrete bullet tip 1",
                "Concrete bullet tip 2",
                "Concrete bullet tip 3",
                "Concrete bullet tip 4"
              ],
              "confidence": 0.95
            }
        """.trimIndent()
    }

    private fun parseGeminiResponse(
        gameName: String,
        rawText: String,
        durationMs: Long,
        fallbackVersion: String?
    ): GameStrategyResult {
        val cleaned = rawText
            .replace("\u0060\u0060\u0060json", "")
            .replace("\u0060\u0060\u0060", "")
            .trim()

        return try {
            val json = JSONObject(cleaned)
            val gameVersion = json.optString("gameVersion", fallbackVersion ?: "Latest Meta")
            val category = json.optString("category", "General Competitive Strategy")
            val insights = json.optString("insights", cleaned)
            val takeawaysList = mutableListOf<String>()

            val jsonArray = json.optJSONArray("takeaways")
            if (jsonArray != null) {
                for (i in 0 until jsonArray.length()) {
                    takeawaysList.add(jsonArray.getString(i))
                }
            } else {
                takeawaysList.add("Focus on map positioning and audio cues in $gameName")
                takeawaysList.add("Optimize weapon balance and resource management")
            }

            val confidence = json.optDouble("confidence", 0.94).toFloat()

            GameStrategyResult(
                gameName = gameName,
                gameVersion = gameVersion,
                category = category,
                insights = insights,
                takeaways = takeawaysList,
                confidence = confidence,
                durationMs = durationMs
            )
        } catch (e: Exception) {
            GameStrategyResult(
                gameName = gameName,
                gameVersion = fallbackVersion ?: "Current Meta",
                category = "Autonomous Analysis",
                insights = rawText.trim(),
                takeaways = listOf(
                    "Review weapon and physics timing in $gameName",
                    "Adapt early rotations to secure high-ground advantage",
                    "Preserve defensive utility for endgame clutches"
                ),
                confidence = 0.88f,
                durationMs = durationMs
            )
        }
    }
}`
  },
  {
    id: 'service',
    name: 'BackgroundLearningService.kt',
    path: 'app/src/main/java/com/technovisaze/learningbot/service/BackgroundLearningService.kt',
    language: 'kotlin',
    category: 'service',
    description: 'Foreground Service equipped with SharedPreferences dynamic intervals, exponential backoff, Room retries, and WAKE_LOCK safety.',
    content: `package com.technovisaze.learningbot.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.technovisaze.learningbot.R
import com.technovisaze.learningbot.ai.GeminiClient
import com.technovisaze.learningbot.data.AppDatabase
import com.technovisaze.learningbot.data.BotMemoryEntity
import com.technovisaze.learningbot.ui.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

/**
 * Service execution status communicated reactively to Compose UI.
 */
data class ServiceRunningState(
    val isRunning: Boolean = false,
    val currentGame: String = "Idle",
    val cycleIteration: Int = 0,
    val lastLearnedTime: Long = 0L,
    val statusMessage: String = "Service is idle",
    val isWakeLockHeld: Boolean = false,
    val intervalMinutes: Int = 30
)

/**
 * BackgroundLearningService:
 * Persistent Foreground Service with WAKE_LOCK, SharedPreferences dynamic interval listener,
 * exponential backoff Gemini retries, and Room DB transaction retries.
 */
class BackgroundLearningService : Service(), SharedPreferences.OnSharedPreferenceChangeListener {

    private val TAG = "TechnovisAzeService"

    // Isolated supervisor coroutine scope running strictly on Dispatchers.IO
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var wakeLock: PowerManager.WakeLock? = null

    private lateinit var database: AppDatabase
    private lateinit var geminiClient: GeminiClient
    private lateinit var sharedPreferences: SharedPreferences

    // Strict sequential queue order: 1. PUBG Mobile -> 2. Roblox -> 3. Minecraft
    private val gameQueue = listOf("PUBG Mobile", "Roblox", "Minecraft")

    // Dynamic delay between game cycles (read from SharedPreferences)
    @Volatile
    private var cycleDelayMs: Long = TimeUnit.MINUTES.toMillis(30)

    companion object {
        const val CHANNEL_ID = "technovisaze_learning_service_channel"
        const val NOTIFICATION_ID = 1001

        const val PREFS_NAME = "technovisaze_learning_prefs"
        const val KEY_INTERVAL_MINUTES = "pref_learning_interval_minutes"
        const val DEFAULT_INTERVAL_MINUTES = 30

        const val ACTION_START = "com.technovisaze.learningbot.ACTION_START"
        const val ACTION_STOP = "com.technovisaze.learningbot.ACTION_STOP"
        const val ACTION_UPDATE_INTERVAL = "com.technovisaze.learningbot.ACTION_UPDATE_INTERVAL"

        private val _serviceState = MutableStateFlow(ServiceRunningState())
        val serviceState: StateFlow<ServiceRunningState> = _serviceState.asStateFlow()

        fun startService(context: Context) {
            val intent = Intent(context, BackgroundLearningService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, BackgroundLearningService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }

        fun updateInterval(context: Context, minutes: Int) {
            val intent = Intent(context, BackgroundLearningService::class.java).apply {
                action = ACTION_UPDATE_INTERVAL
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "TechnovisAze BackgroundLearningService initialized")

        database = AppDatabase.getInstance(applicationContext)
        val apiKey = getString(R.string.gemini_api_key)
        geminiClient = GeminiClient(apiKey)

        // Initialize SharedPreferences and register change listener
        sharedPreferences = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        sharedPreferences.registerOnSharedPreferenceChangeListener(this)
        loadConfiguredInterval()

        createNotificationChannel()
        acquireWakeLock()
    }

    override fun onSharedPreferenceChanged(prefs: SharedPreferences?, key: String?) {
        if (key == KEY_INTERVAL_MINUTES) {
            loadConfiguredInterval()
        }
    }

    private fun loadConfiguredInterval() {
        val minutes = sharedPreferences.getInt(KEY_INTERVAL_MINUTES, DEFAULT_INTERVAL_MINUTES)
        cycleDelayMs = TimeUnit.MINUTES.toMillis(minutes.toLong())
        Log.i(TAG, "Learning interval dynamically updated to $minutes minutes (\${cycleDelayMs}ms)")
        _serviceState.value = _serviceState.value.copy(intervalMinutes = minutes)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                loadConfiguredInterval()
                startForegroundWithNotification("Autonomous Learning Loop Starting...")
                startAutonomousLearningLoop()
            }
            ACTION_STOP -> {
                stopForegroundLoop()
            }
            ACTION_UPDATE_INTERVAL -> {
                loadConfiguredInterval()
            }
        }
        return START_STICKY
    }

    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "TechnovisAze::BackgroundLearningWakeLock"
            ).apply {
                setReferenceCounted(false)
                acquire(10 * 60 * 1000L) // Safe 10m window
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to acquire WakeLock: \${e.message}")
        }
    }

    private fun releaseWakeLock() {
        try {
            wakeLock?.let {
                if (it.isHeld) {
                    it.release()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing WakeLock: \${e.message}")
        }
    }

    /**
     * Resilient database insertion with retry logic (3 attempts with 500ms delay).
     * Prevents database locking errors from interrupting background execution.
     */
    private suspend fun safeDatabaseInsert(entity: BotMemoryEntity, maxRetries: Int = 3): Long {
        var lastException: Exception? = null
        for (attempt in 1..maxRetries) {
            try {
                val rowId = database.botMemoryDao().insertMemory(entity)
                Log.d(TAG, "Room DB insert succeeded on attempt $attempt (rowId: $rowId)")
                return rowId
            } catch (e: Exception) {
                lastException = e
                Log.w(TAG, "Room DB insert attempt $attempt/$maxRetries failed for \${entity.gameName}: \${e.message}")
                if (attempt < maxRetries) {
                    delay(500L)
                }
            }
        }
        Log.e(TAG, "All Room DB insert attempts exhausted for \${entity.gameName}", lastException)
        throw lastException ?: IllegalStateException("Database insertion failed")
    }

    /**
     * Core Autonomous Sequential Learning Loop.
     * Iterates: 1. PUBG Mobile -> 2. Roblox -> 3. Minecraft -> delay(cycleDelayMs) -> repeat.
     */
    private fun startAutonomousLearningLoop() {
        serviceScope.launch {
            var queueIndex = 0
            var loopIteration = 1

            _serviceState.value = ServiceRunningState(
                isRunning = true,
                currentGame = gameQueue[queueIndex],
                cycleIteration = loopIteration,
                statusMessage = "Starting initial learning cycle...",
                isWakeLockHeld = wakeLock?.isHeld == true,
                intervalMinutes = TimeUnit.MILLISECONDS.toMinutes(cycleDelayMs).toInt()
            )

            while (isActive) {
                val targetGame = gameQueue[queueIndex]
                val currentIntervalMinutes = TimeUnit.MILLISECONDS.toMinutes(cycleDelayMs).toInt()
                val statusMsg = "Analyzing $targetGame meta strategies (Cycle #$loopIteration)..."

                Log.i(TAG, "=== Starting Autonomous Learning for: $targetGame [Cycle #$loopIteration] ===")
                updateNotification(statusMsg)

                _serviceState.value = _serviceState.value.copy(
                    isRunning = true,
                    currentGame = targetGame,
                    cycleIteration = loopIteration,
                    statusMessage = statusMsg,
                    isWakeLockHeld = wakeLock?.isHeld == true,
                    intervalMinutes = currentIntervalMinutes
                )

                // Acquire WakeLock during network call
                if (wakeLock?.isHeld == false) {
                    wakeLock?.acquire(5 * 60 * 1000L)
                }

                try {
                    // Call Gemini API with exponential backoff retries
                    val result = geminiClient.generateGameStrategyWithRetry(
                        gameName = targetGame,
                        cycleIteration = loopIteration,
                        maxRetries = 3,
                        initialDelayMs = 2000L
                    )

                    result.onSuccess { strategy ->
                        val learnedTime = System.currentTimeMillis()
                        val memoryEntity = BotMemoryEntity(
                            gameName = strategy.gameName,
                            gameVersion = strategy.gameVersion,
                            strategyCategory = strategy.category,
                            insightContent = strategy.insights,
                            keyTakeaways = strategy.takeaways,
                            confidenceScore = strategy.confidence,
                            cycleIteration = loopIteration,
                            executionDurationMs = strategy.durationMs,
                            timestamp = learnedTime,
                            timestampLearned = learnedTime
                        )

                        // Insert into Room DB with retry mechanism
                        safeDatabaseInsert(memoryEntity)
                        Log.i(TAG, "Successfully learned & saved [\${strategy.gameVersion}] $targetGame")

                        _serviceState.value = _serviceState.value.copy(
                            lastLearnedTime = learnedTime,
                            statusMessage = "Learned $targetGame (\${strategy.gameVersion}) - \${strategy.takeaways.size} takeaways"
                        )
                    }.onFailure { error ->
                        Log.e(TAG, "Gemini learning failed for $targetGame after all retries: \${error.message}")
                        _serviceState.value = _serviceState.value.copy(
                            statusMessage = "Analysis error on $targetGame: \${error.localizedMessage}. Continuing loop..."
                        )
                    }

                } catch (e: Exception) {
                    Log.e(TAG, "Unexpected error in learning cycle: \${e.message}", e)
                }

                // Advance queue in sequential order: PUBG -> Roblox -> Minecraft
                queueIndex = (queueIndex + 1) % gameQueue.size
                if (queueIndex == 0) {
                    loopIteration++
                }

                val nextGame = gameQueue[queueIndex]
                val delayMinutes = TimeUnit.MILLISECONDS.toMinutes(cycleDelayMs)
                val waitingMsg = "Sleeping \${delayMinutes}m before next game ($nextGame)..."
                Log.d(TAG, waitingMsg)

                updateNotification("Idle: Next game is $nextGame in \${delayMinutes}m")
                _serviceState.value = _serviceState.value.copy(
                    currentGame = "Waiting -> $nextGame",
                    statusMessage = waitingMsg
                )

                // Temporarily release WakeLock during sleep to conserve battery and zero-out CPU
                releaseWakeLock()

                // Autonomous delay configured via SharedPreferences
                delay(cycleDelayMs)

                // Re-acquire WakeLock on wake
                acquireWakeLock()
            }
        }
    }

    private fun stopForegroundLoop() {
        Log.i(TAG, "Stopping TechnovisAze BackgroundLearningService")
        serviceScope.cancel()
        releaseWakeLock()

        _serviceState.value = ServiceRunningState(
            isRunning = false,
            statusMessage = "Service stopped by user",
            isWakeLockHeld = false
        )

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun startForegroundWithNotification(initialText: String) {
        val notification = buildNotification(initialText)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun updateNotification(text: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildNotification(text))
    }

    private fun buildNotification(contentText: String): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, BackgroundLearningService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("TechnovisAze Learning Bot Active")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_bot_notification)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .addAction(R.drawable.ic_stop, "Stop Learning", stopPendingIntent)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Autonomous Learning Service Channel",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows live status of background Gemini AI game strategy synthesis."
                setShowBadge(false)
            }

            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        sharedPreferences.unregisterOnSharedPreferenceChangeListener(this)
        serviceScope.cancel()
        releaseWakeLock()
        _serviceState.value = ServiceRunningState(isRunning = false, statusMessage = "Service destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`
  },
  {
    id: 'main-activity',
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/technovisaze/learningbot/ui/MainActivity.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'Jetpack Compose UI with interactive interval slider, SharedPreferences persistence, version badges, and live Room DB observer.',
    content: `package com.technovisaze.learningbot.ui

import android.Manifest
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.technovisaze.learningbot.data.BotMemoryEntity
import com.technovisaze.learningbot.service.BackgroundLearningService
import com.technovisaze.learningbot.service.ServiceRunningState
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.roundToInt

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TechnovisAzeTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: MainViewModel = viewModel()) {
    val context = LocalContext.current
    val serviceState by BackgroundLearningService.serviceState.collectAsState()
    val memories by viewModel.allMemories.collectAsState(initial = emptyList())
    var selectedGameFilter by remember { mutableStateOf("ALL") }

    // SharedPreferences for learning interval
    val prefs: SharedPreferences = remember {
        context.getSharedPreferences(BackgroundLearningService.PREFS_NAME, Context.MODE_PRIVATE)
    }

    var intervalMinutes by remember {
        mutableStateOf(prefs.getInt(BackgroundLearningService.KEY_INTERVAL_MINUTES, BackgroundLearningService.DEFAULT_INTERVAL_MINUTES).toFloat())
    }

    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            BackgroundLearningService.startService(context)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "TechnovisAze Learning Bot",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        Text(
                            text = "Autonomous Background Gaming AI",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.clearDatabase() }) {
                        Icon(Icons.Default.DeleteSweep, contentDescription = "Clear Memories")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainer
                )
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { Spacer(modifier = Modifier.height(4.dp)) }

            // 1. Service Control & Status Card
            item {
                ServiceControlCard(
                    state = serviceState,
                    onToggleService = {
                        if (serviceState.isRunning) {
                            BackgroundLearningService.stopService(context)
                        } else {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                                ContextCompat.checkSelfPermission(
                                    context,
                                    Manifest.permission.POST_NOTIFICATIONS
                                ) != PackageManager.PERMISSION_GRANTED
                            ) {
                                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            } else {
                                BackgroundLearningService.startService(context)
                            }
                        }
                    }
                )
            }

            // 2. Learning Interval Configuration Card (SharedPreferences)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Icon(Icons.Default.Timer, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.primary)
                                Text("Learning Cycle Delay", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                            Text(
                                text = "\${intervalMinutes.roundToInt()} minutes",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Text(
                            text = "Configures the idle delay between game iterations to keep background CPU impact below 0.1%.",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        // Interval Slider (1 min to 120 mins)
                        Slider(
                            value = intervalMinutes,
                            onValueChange = { newValue ->
                                intervalMinutes = newValue
                                val rounded = newValue.roundToInt()
                                prefs.edit().putInt(BackgroundLearningService.KEY_INTERVAL_MINUTES, rounded).apply()
                                BackgroundLearningService.updateInterval(context, rounded)
                            },
                            valueRange = 1f..120f,
                            steps = 119
                        )

                        // Quick preset buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            listOf(5, 15, 30, 60).forEach { preset ->
                                AssistChip(
                                    onClick = {
                                        intervalMinutes = preset.toFloat()
                                        prefs.edit().putInt(BackgroundLearningService.KEY_INTERVAL_MINUTES, preset).apply()
                                        BackgroundLearningService.updateInterval(context, preset)
                                    },
                                    label = { Text("\${preset}m", fontSize = 11.sp) },
                                    colors = AssistChipDefaults.assistChipColors(
                                        containerColor = if (intervalMinutes.roundToInt() == preset)
                                            MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                                        else
                                            MaterialTheme.colorScheme.surface
                                    )
                                )
                            }
                        }
                    }
                }
            }

            // 3. Sequential Queue Stepper (1. PUBG Mobile -> 2. Roblox -> 3. Minecraft)
            item {
                QueueTrackerCard(serviceState = serviceState)
            }

            // 4. Stored Strategies Section & Game Filters
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Learned Strategies (Room DB)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Text(
                            text = "\${memories.size} Indexed",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("ALL", "PUBG Mobile", "Roblox", "Minecraft").forEach { game ->
                            FilterChip(
                                selected = selectedGameFilter == game,
                                onClick = { selectedGameFilter = game },
                                label = { Text(game, fontSize = 12.sp) }
                            )
                        }
                    }
                }
            }

            // 5. Memory Items List
            val filteredMemories = remember(memories, selectedGameFilter) {
                if (selectedGameFilter == "ALL") memories
                else memories.filter { it.gameName == selectedGameFilter }
            }

            if (filteredMemories.isEmpty()) {
                item {
                    EmptyStateCard(isRunning = serviceState.isRunning)
                }
            } else {
                items(filteredMemories, key = { it.id }) { memory ->
                    MemoryItemCard(memory = memory)
                }
            }

            item { Spacer(modifier = Modifier.height(24.dp)) }
        }
    }
}

@Composable
fun ServiceControlCard(
    state: ServiceRunningState,
    onToggleService: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (state.isRunning)
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
            else
                MaterialTheme.colorScheme.surfaceVariant
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(if (state.isRunning) Color(0xFF10B981) else Color(0xFFEF4444))
                    )
                    Text(
                        text = if (state.isRunning) "FOREGROUND SERVICE ACTIVE" else "SERVICE STOPPED",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        letterSpacing = 0.5.sp
                    )
                }

                AssistChip(
                    onClick = {},
                    label = {
                        Text(
                            text = if (state.isWakeLockHeld) "WAKELOCK HELD" else "CPU SLEEP",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    },
                    leadingIcon = {
                        Icon(
                            if (state.isWakeLockHeld) Icons.Default.Bolt else Icons.Default.Bedtime,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                )
            }

            Text(
                text = state.statusMessage,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurface
            )

            Button(
                onClick = onToggleService,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (state.isRunning)
                        MaterialTheme.colorScheme.error
                    else
                        MaterialTheme.colorScheme.primary
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(
                    if (state.isRunning) Icons.Default.Stop else Icons.Default.PlayArrow,
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (state.isRunning) "Stop Background Service" else "Start Autonomous Learning Loop",
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun QueueTrackerCard(serviceState: ServiceRunningState) {
    val games = listOf("PUBG Mobile", "Roblox", "Minecraft")

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Autonomous Queue Order",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
                Text(
                    text = "Cycle #\${serviceState.cycleIteration}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                games.forEachIndexed { index, gameName ->
                    val isCurrent = serviceState.currentGame.contains(gameName)
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isCurrent) MaterialTheme.colorScheme.primary
                                    else MaterialTheme.colorScheme.surfaceVariant
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "\${index + 1}",
                                color = if (isCurrent) MaterialTheme.colorScheme.onPrimary
                                else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = gameName,
                            fontSize = 11.sp,
                            fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                            color = if (isCurrent) MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MemoryItemCard(memory: BotMemoryEntity) {
    var expanded by remember { mutableStateOf(false) }
    val dateFormat = remember { SimpleDateFormat("HH:mm:ss", Locale.getDefault()) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow)
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = memory.gameName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                    // Version badge
                    Surface(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = memory.gameVersion,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                Text(
                    text = dateFormat.format(Date(memory.timestampLearned)),
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.outline
                )
            }

            Text(
                text = memory.strategyCategory,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.secondary
            )

            Text(
                text = memory.insightContent,
                fontSize = 13.sp,
                lineHeight = 18.sp,
                maxLines = if (expanded) Int.MAX_VALUE else 3
            )

            if (memory.keyTakeaways.isNotEmpty()) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Key Takeaways:",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp
                    )
                    memory.keyTakeaways.forEach { takeaway ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Text("•", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                            Text(takeaway, fontSize = 12.sp)
                        }
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Confidence: \${(memory.confidenceScore * 100).toInt()}% · Cycle #\${memory.cycleIteration}",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.outline
                )
                TextButton(onClick = { expanded = !expanded }) {
                    Text(if (expanded) "Show Less" else "Show More", fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
fun EmptyStateCard(isRunning: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(Icons.Default.SportsEsports, contentDescription = null, modifier = Modifier.size(40.dp))
            Text(
                text = "No strategies recorded yet",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Text(
                text = if (isRunning)
                    "Background service is analyzing PUBG Mobile... insights will appear shortly."
                else
                    "Tap 'Start Autonomous Learning Loop' to begin the background cycle.",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun TechnovisAzeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF6366F1),
            primaryContainer = Color(0xFF312E81),
            secondary = Color(0xFF06B6D4),
            surface = Color(0xFF0F172A),
            surfaceVariant = Color(0xFF1E293B),
            surfaceContainer = Color(0xFF1E293B),
            surfaceContainerLow = Color(0xFF151F32),
            background = Color(0xFF090D16)
        ),
        content = content
    )
}`
  },
  {
    id: 'viewmodel',
    name: 'MainViewModel.kt',
    path: 'app/src/main/java/com/technovisaze/learningbot/ui/MainViewModel.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'Android ViewModel connecting Room DB Flow to Jetpack Compose UI state.',
    content: `package com.technovisaze.learningbot.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.technovisaze.learningbot.data.AppDatabase
import com.technovisaze.learningbot.data.BotMemoryEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val database = AppDatabase.getInstance(application)
    private val dao = database.botMemoryDao()

    // Observe all memories reactively in reverse chronological order
    val allMemories: Flow<List<BotMemoryEntity>> = dao.getAllMemories()

    fun clearDatabase() {
        viewModelScope.launch {
            dao.clearAllMemories()
        }
    }
}`
  },
  {
    id: 'build-gradle-app',
    name: 'build.gradle.kts (Module: app)',
    path: 'app/build.gradle.kts',
    language: 'groovy',
    category: 'gradle',
    description: 'App-level Gradle script configured with KSP, Room DB, Google Generative AI SDK, Coroutines, and Jetpack Compose BOM.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.ksp) // Kotlin Symbol Processing for Room
}

android {
    namespace = "com.technovisaze.learningbot"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.technovisaze.learningbot"
        minSdk = 26
        targetSdk = 34
        versionCode = 2
        versionName = "1.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // Configure Gemini API Key via local.properties or environment
        val apiKey = project.findProperty("GEMINI_API_KEY") as? String ?: ""
        resValue("string", "gemini_api_key", apiKey)
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        resValues = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX & Core KTX
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose BOM
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.lifecycle.viewmodel.compose)

    // Room Database
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // Google Generative AI SDK (Gemini for Android)
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")

    // Kotlin Coroutines
    val coroutinesVersion = "1.7.3"
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutinesVersion")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:$coroutinesVersion")
}`
  },
  {
    id: 'build-gradle-root',
    name: 'build.gradle.kts (Project)',
    path: 'build.gradle.kts',
    language: 'groovy',
    category: 'gradle',
    description: 'Root Gradle buildscript declaring KSP and Android plugins.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.ksp) apply false
}`
  }
];
